import Settings from "../modules/settings/model/settings.model.js";

/**
 * Worker to auto-increment review counts daily
 * This runs once per day and updates all stores with custom review count mode
 */
export async function updateReviewCounts() {
  try {

    // Get all settings with custom review count mode enabled
    const stores = await Settings.find({
      "review_count.enabled": true,
      "review_count.mode": "custom",
    });

    console.log(
      `[Review Count Worker] Found ${stores.length} stores to update`
    );

    for (const store of stores) {
      try {
        // Check if we need to update (if last update was more than 24 hours ago)
        const lastUpdate = new Date(store.review_count.last_update_date);
        const now = new Date();
        const hoursSinceLastUpdate = (now - lastUpdate) / (1000 * 60 * 60);

        if (hoursSinceLastUpdate >= 24) {
          // Generate random increase between min and max
          const min = store.review_count.daily_increase_min || 1;
          const max = store.review_count.daily_increase_max || 5;
          const randomIncrease =
            Math.floor(Math.random() * (max - min + 1)) + min;

          // Update the count
          const newCount =
            (store.review_count.current_count || 0) + randomIncrease;

          // Update in database
          await Settings.findByIdAndUpdate(store._id, {
            "review_count.current_count": newCount,
            "review_count.last_update_date": now,
          });

          console.log(
            `[Review Count Worker] Updated store ${store.store_id}: ${store.review_count.current_count} → ${newCount} (+${randomIncrease})`
          );
        } else {
          console.log(
            `[Review Count Worker] Store ${
              store.store_id
            } was updated ${hoursSinceLastUpdate.toFixed(1)}h ago, skipping`
          );
        }
      } catch (error) {
        console.error(
          `[Review Count Worker] Error updating store ${store.store_id}:`,
          error
        );
      }
    }

    console.log("[Review Count Worker] Daily review count update completed");
  } catch (error) {
    console.error("[Review Count Worker] Error in updateReviewCounts:", error);
  }
}

/**
 * Start the review count worker with daily interval
 */
export function startReviewCountWorker() {
  console.log("[Review Count Worker] Starting worker...");

  // Run immediately on startup
  updateReviewCounts();

  // Run every 24 hours (86400000 milliseconds)
  setInterval(updateReviewCounts, 24 * 60 * 60 * 1000);

  console.log("[Review Count Worker] Worker started, will run every 24 hours");
}
