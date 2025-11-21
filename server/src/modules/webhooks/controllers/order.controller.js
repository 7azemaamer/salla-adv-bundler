import { asyncWrapper } from "../../../utils/errorHandler.js";
import Order from "../model/order.model.js";
import BundleConfig from "../../bundles/model/bundleConfig.model.js";
import bundleService from "../../bundles/services/bundle.service.js";

/**
 * Extract bundle information from order items
 * Multiple detection methods:
 * 1. Check notes for bundle metadata (most reliable)
 * 2. Check for has_special_price flag in products
 * 3. Match order items with bundle tier configuration
 */
const extractBundleItems = async (orderItems, storeId, orderData) => {
  const bundleItems = [];

  // Method 1: Extract from notes (primary method)
  for (const item of orderItems) {
    if (item.notes && item.notes.includes("Bundle:")) {
      try {
        const bundleMatch = item.notes.match(/Bundle:\s*([a-f0-9]{24})/i);
        const tierMatch = item.notes.match(/Tier:\s*(\d+)/i);

        if (bundleMatch && tierMatch) {
          const bundleId = bundleMatch[1];
          const tierId = parseInt(tierMatch[1]);

          const bundle = await BundleConfig.findOne({
            _id: bundleId,
            store_id: storeId,
          }).select("name bundles");

          if (bundle) {
            const tier = bundle.bundles.find((t) => t.tier === tierId);

            bundleItems.push({
              bundle_id: bundleId,
              bundle_name: bundle.name,
              tier_id: tierId,
              tier_name: tier?.tier_title || `Tier ${tierId}`,
              quantity: item.quantity || 1,
              total_price: item.amounts?.total?.amount || 0,
              detection_method: "notes",
              products: [
                {
                  product_id: item.product?.id?.toString(),
                  product_name: item.name,
                  quantity: item.quantity || 1,
                  price: item.amounts?.price_without_tax?.amount || 0,
                },
              ],
            });
          }
        }
      } catch (error) {
        console.error(
          `[Order Webhook] Error extracting bundle from notes:`,
          error
        );
      }
    }
  }

  // Method 2: Check for special offers/discounts if no bundle found in notes
  if (bundleItems.length === 0 && orderData.amounts?.discounts?.length > 0) {
    try {
      // Find active bundles for this store
      const activeBundles = await BundleConfig.find({
        store_id: storeId,
        status: "active",
      }).select("name bundles target_product_id");

      for (const bundle of activeBundles) {
        // Check if any order item matches the target product
        const targetItem = orderItems.find(
          (item) =>
            item.product?.id?.toString() ===
            bundle.target_product_id?.toString()
        );

        if (targetItem && targetItem.product?.has_special_price) {
          // Try to match order total with bundle tier pricing
          for (const tier of bundle.bundles) {
            const expectedQuantity = tier.buy_quantity || tier.tier;

            // Check if quantity matches
            if (targetItem.quantity === expectedQuantity) {
              // Calculate expected tier price (simplified - can be enhanced)
              const basePrice = targetItem.product?.regular_price?.amount || 0;
              const orderItemPrice = targetItem.amounts?.total?.amount || 0;

              // If there's a discount applied, likely from our bundle
              if (orderItemPrice < basePrice * expectedQuantity) {
                bundleItems.push({
                  bundle_id: bundle._id.toString(),
                  bundle_name: bundle.name,
                  tier_id: tier.tier,
                  tier_name: tier.tier_title || `Tier ${tier.tier}`,
                  quantity: targetItem.quantity || 1,
                  total_price: orderItemPrice,
                  detection_method: "special_offer",
                  products: [
                    {
                      product_id: targetItem.product?.id?.toString(),
                      product_name: targetItem.name,
                      quantity: targetItem.quantity || 1,
                      price: targetItem.amounts?.price_without_tax?.amount || 0,
                    },
                  ],
                });
                break; // Found matching tier
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(
        `[Order Webhook] Error detecting bundle from special offers:`,
        error
      );
    }
  }

  return bundleItems;
};

/**
 * Process order.created webhook
 */
export const handleOrderCreated = asyncWrapper(async (req, res) => {
  const { event, merchant } = req.body;
  const orderData = req.body?.data;

  if (event !== "order.created") {
    return res.status(400).json({
      success: false,
      message: "Invalid event type",
    });
  }

  console.log(
    `\n[Order Webhook] Processing order ${orderData.id} for store ${merchant}`
  );

  try {
    const storeId = merchant.toString();

    // Check if order already exists
    const existingOrder = await Order.findOne({
      order_id: orderData.id.toString(),
    });
    if (existingOrder) {
      console.log(`[Order Webhook] Order ${orderData.id} already processed`);
      return res.status(200).json({
        success: true,
        message: "Order already processed",
      });
    }

    // Extract bundle items from order
    const bundleItems = await extractBundleItems(
      orderData.items || [],
      storeId,
      orderData
    );

    // Only save order if it contains bundle items
    if (bundleItems.length === 0) {
      console.log(
        `[Order Webhook] Order ${orderData.id} contains no bundle items, skipping`
      );
      return res.status(200).json({
        success: true,
        message: "No bundle items in order",
      });
    }

    console.log(
      `[Order Webhook] Detected ${
        bundleItems.length
      } bundle items using methods: ${bundleItems
        .map((b) => b.detection_method)
        .join(", ")}`
    );

    // Create order record
    const order = await Order.create({
      order_id: orderData.id.toString(),
      reference_id: orderData.reference_id?.toString(),
      store_id: storeId,
      status: {
        slug: orderData.status?.slug,
        name: orderData.status?.name,
      },
      payment_method: orderData.payment_method,
      currency: orderData.currency,
      total_amount: orderData.amounts?.total?.amount || 0,
      order_date: orderData.date?.date
        ? new Date(orderData.date.date)
        : new Date(),
      customer: {
        id: orderData.customer?.id?.toString(),
        name: `${orderData.customer?.first_name || ""} ${
          orderData.customer?.last_name || ""
        }`.trim(),
        email: orderData.customer?.email,
      },
      bundle_items: bundleItems,
      analytics_processed: false,
    });

    console.log(
      `[Order Webhook] Order ${orderData.id} saved with ${bundleItems.length} bundle items`
    );

    // Update analytics for each bundle item
    for (const bundleItem of bundleItems) {
      try {
        // Track conversion
        await bundleService.trackBundleConversion(
          bundleItem.bundle_id,
          bundleItem.total_price
        );

        // Track tier checkout
        await bundleService.trackTierCheckout(
          bundleItem.bundle_id,
          bundleItem.tier_id
        );

        console.log(
          `[Order Webhook] Analytics updated for bundle ${bundleItem.bundle_id}, tier ${bundleItem.tier_id}`
        );
      } catch (error) {
        console.error(
          `[Order Webhook] Failed to update analytics for bundle ${bundleItem.bundle_id}:`,
          error
        );
      }
    }

    // Mark analytics as processed
    order.analytics_processed = true;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order processed successfully",
      bundle_items_count: bundleItems.length,
    });
  } catch (error) {
    console.error(`[Order Webhook] Error processing order:`, error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process order",
    });
  }
});
