import { asyncWrapper } from "../../../utils/errorHandler.js";

/* ===============
 * Handle Coupon Applied Webhook
 * This webhook is triggered when a customer applies a coupon code
 * ===============*/
export const handleCouponApplied = asyncWrapper(async (req, res) => {
  const { event, merchant, created_at, data } = req.body;

  console.log("\n" + "=".repeat(80));
  console.log(`🎟️ COUPON APPLIED WEBHOOK`);
  console.log("=".repeat(80));
  console.log(`Merchant: ${merchant}`);
  console.log(`Event: ${event}`);
  console.log(`Created: ${created_at}`);

  if (data && data.cart) {
    const { cart } = data;
    console.log(`Cart ID: ${cart.id}`);
    console.log(`Cart Total: ${cart.total.amount} ${cart.total.currency}`);
    console.log(
      `Cart Subtotal: ${cart.subtotal.amount} ${cart.subtotal.currency}`
    );
    console.log(
      `Total Discount: ${cart.total_discount.amount} ${cart.total_discount.currency}`
    );

    if (cart.coupon) {
      console.log("\nCoupon Details:");
      console.log(`  Code: ${cart.coupon.code}`);
      console.log(`  Type: ${cart.coupon.type}`);
      console.log(
        `  Amount: ${cart.coupon.amount.amount} ${cart.coupon.amount.currency}`
      );
      console.log(`  Status: ${cart.coupon.status}`);
      if (cart.coupon.expiry_date) {
        console.log(`  Expires: ${cart.coupon.expiry_date}`);
      }
    }

    if (cart.items && cart.items.length > 0) {
      console.log(`\nCart Items (${cart.items.length}):`);
      cart.items.forEach((item, index) => {
        console.log(
          `  ${index + 1}. Product ID: ${item.product_id}, Qty: ${
            item.quantity
          }`
        );
      });
    }

    if (cart.customer) {
      console.log(
        `\nCustomer: ${cart.customer.name} (ID: ${cart.customer.id})`
      );
    }
  }

  console.log("=".repeat(80) + "\n");

  // Note: The coupon discount is already applied by Salla to the cart total.
  // Our bundle modal will fetch the current cart state via Salla's API
  // when the customer opens it, so the coupon discount will be reflected automatically.

  // Optional: Store coupon application for analytics/tracking
  // You can implement a CouponApplication model here if needed for reporting

  res.status(200).json({
    success: true,
    message: "Coupon application logged",
  });
});
