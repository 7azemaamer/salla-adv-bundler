import { asyncWrapper } from "../../../utils/errorHandler.js";
import storeService from "../../stores/services/store.service.js";
import { sendWelcomeMessage } from "../services/notification.service.js";
import { fetchPaymentMethods } from "../../bundles/services/payment.service.js";
import Store from "../../stores/model/store.model.js";

/* ===============
 * listen for new stores and register them in db (Easy Mode)
 * ===============*/
export const registerNewStore = asyncWrapper(async (req, res) => {
  const { event, merchant } = req.body;
  const payload = req.body?.data;

  // Log all webhook data for debugging
  console.log("\n" + "=".repeat(80));
  console.log(`🔔 WEBHOOK RECEIVED: ${event}`);
  console.log("=".repeat(80));
  console.log("Full Request Body:");
  console.log(JSON.stringify(req.body, null, 2));
  console.log("=".repeat(80) + "\n");

  switch (event) {
    case "coupon.applied":
      // Handle coupon applied webhook
      const cartData = payload?.cart;
      if (cartData && cartData.coupon) {
        console.log(
          `[Webhook]: Coupon "${cartData.coupon.code}" applied to cart ${cartData.id} for store ${merchant}`
        );
        console.log(`  Coupon type: ${cartData.coupon.type}`);
        console.log(
          `  Discount amount: ${cartData.coupon.amount.amount} ${cartData.coupon.amount.currency}`
        );
        console.log(
          `  Cart total after discount: ${cartData.total.amount} ${cartData.total.currency}`
        );
      }
      // Note: The bundle modal will fetch current cart state from Salla API
      // so coupon discounts will be reflected automatically
      break;

    case "app.store.authorize":
      const existingStore = await Store.findOne({ store_id: merchant });
      const isNewInstall = !existingStore;
      const isReinstall = existingStore && existingStore.is_deleted === true;

      await storeService.saveStore({ store_id: merchant, payload });

      if (isNewInstall) {
        console.log(
          `[Webhook - Easy Mode]: Store ${merchant} NEW INSTALL - tokens saved`
        );
      } else if (isReinstall) {
        console.log(
          `[Webhook - Easy Mode]: Store ${merchant} RE-INSTALLED - reactivated with new tokens`
        );
      } else {
        console.log(`[Webhook - Easy Mode]: Store ${merchant} tokens updated`);
      }

      if ((isNewInstall || isReinstall) && payload.access_token) {
        try {
          await sendWelcomeMessage(
            merchant,
            payload.access_token,
            isReinstall ? "reinstall" : "install"
          );
        } catch (error) {
          console.error(
            `[Webhook]: Failed to send welcome message to ${merchant}:`,
            error.message
          );
        }

        // Fetch and cache payment methods on installation
        try {
          const methodsResult = await fetchPaymentMethods(payload.access_token);

          const store = await Store.findOne({ store_id: merchant });
          if (store && methodsResult.data) {
            store.payment_methods = methodsResult.data;
            store.payment_methods_updated_at = new Date();
            await store.save();
            console.log(
              `[Webhook]: Cached ${methodsResult.data.length} payment methods for store ${merchant}`
            );
          }
        } catch (error) {
          console.error(
            `[Webhook]: Failed to fetch payment methods for ${merchant}:`,
            error.message
          );
        }
      }
      break;

    case "app.installed":
      console.log(
        `[Webhook]: Store ${merchant} app.installed event received (waiting for app.store.authorize with tokens)`
      );

      // Respond immediately so Salla knows we received it
      res.status(200).send("ok");
      return; // Don't continue to the end
      break;
    case "app.uninstalled":
      await storeService.deleteStore(merchant);
      console.log(
        `[Webhook]: Store ${merchant} uninstalled (soft deleted - bundles disabled)`
      );
      break;
    case "app.subscription.started":
      await storeService.updateStorePlan(
        merchant,
        payload.plan_type || "basic"
      );
      console.log(
        `[Webhook]: Store ${merchant} subscription started with plan: ${payload.plan_type}`
      );
      break;

    case "app.subscription.renewed":
      await storeService.updateStorePlan(
        merchant,
        payload.plan_type || "basic"
      );
      console.log(
        `[Webhook]: Store ${merchant} subscription renewed with plan: ${payload.plan_type}`
      );
      break;

    case "app.subscription.canceled":
      await storeService.updateStorePlan(merchant, "basic");
      console.log(
        `[Webhook]: Store ${merchant} subscription canceled, reverted to basic plan`
      );
      break;

    case "app.subscription.expired":
      await storeService.updateStorePlan(merchant, "basic");
      console.log(
        `[Webhook]: Store ${merchant} subscription expired, reverted to basic plan`
      );
      break;

    case "app.updated":
      // Easy Mode: After app.updated, Salla will send app.store.authorize with new tokens
      console.log(
        `[Webhook - Easy Mode]: App updated for store ${merchant}, waiting for app.store.authorize with new tokens`
      );
      break;

    default:
      console.log(
        `[Webhook]: Unhandled event ${event} for merchant ${merchant}`
      );
  }

  res.status(200).send("ok");
});
