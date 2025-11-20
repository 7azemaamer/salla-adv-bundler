import WorkerStatus from "../modules/admin/model/workerStatus.model.js";

/**
 * Wrapper function to execute worker with automatic tracking
 * @param {string} workerName - Name of the worker
 * @param {Function} workerFunction - Async function to execute
 */
export async function executeWithTracking(workerName, workerFunction) {
  const startTime = await trackWorkerStart(workerName);

  try {
    await workerFunction();
    await trackWorkerSuccess(workerName, startTime);
  } catch (error) {
    await trackWorkerError(workerName, error, startTime);
    throw error;
  }
}

/**
 * Mark worker as running and increment run count
 * @param {string} workerName - Name of the worker
 * @returns {Date} Start time
 */
export async function trackWorkerStart(workerName) {
  const startTime = new Date();

  try {
    await WorkerStatus.findOneAndUpdate(
      { name: workerName },
      {
        $set: {
          status: "running",
          last_run_at: startTime,
        },
        $inc: {
          run_count: 1,
        },
      },
      { upsert: true }
    );
  } catch (error) {
    console.error(`Failed to track worker start for ${workerName}:`, error);
  }

  return startTime;
}

/**
 * Mark worker as successful and record duration
 * @param {string} workerName - Name of the worker
 * @param {Date} startTime - When the worker started
 */
export async function trackWorkerSuccess(workerName, startTime) {
  const endTime = new Date();
  const duration = endTime - startTime;

  try {
    await WorkerStatus.findOneAndUpdate(
      { name: workerName },
      {
        $set: {
          status: "success",
          last_success_at: endTime,
          last_duration_ms: duration,
          last_error_message: null,
        },
        $inc: {
          success_count: 1,
        },
      }
    );
  } catch (error) {
    console.error(`Failed to track worker success for ${workerName}:`, error);
  }
}

/**
 * Mark worker as failed and record error
 * @param {string} workerName - Name of the worker
 * @param {Error} error - The error that occurred
 * @param {Date} startTime - When the worker started
 */
export async function trackWorkerError(workerName, error, startTime) {
  const endTime = new Date();
  const duration = endTime - startTime;

  try {
    await WorkerStatus.findOneAndUpdate(
      { name: workerName },
      {
        $set: {
          status: "error",
          last_error_at: endTime,
          last_error_message: error.message,
          last_duration_ms: duration,
        },
        $inc: {
          error_count: 1,
        },
      }
    );
  } catch (err) {
    console.error(`Failed to track worker error for ${workerName}:`, err);
  }
}
