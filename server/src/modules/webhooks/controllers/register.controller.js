import { asyncWrapper } from "../../../utils/errorHandler.js";
import storeService from "../../stores/services/store.service.js";

/* ===============
 * listen for new stores and register them in db
 * ===============*/
export const registerNewStore = asyncWrapper(async (req, res) => {
  const { event, merchant } = req.body;
  const payload = req.body?.data;

  switch (event) {
    case "app.store.authorize":
    case "app.installed":
      await storeService.saveStore({ store_id: merchant, payload });
      console.log(
        `[Webhook]: Store ${merchant} installed & saved (event: ${event})`
      );
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

    default:
      console.log(
        `[Webhook]: Unhandled event ${event} for merchant ${merchant}`
      );
  }

  res.status(200).send("ok");
});
