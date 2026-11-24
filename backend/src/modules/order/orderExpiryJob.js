import { expireOverdueOrdersService } from "./orderService.js";

// Default polling interval set to 60,000 ms (1 minute) in milliseconds.
const DEFAULT_INTERVAL_MS = 60 * 1000; // Check every 60 seconds

/**
 * Starts a background polling job that periodically checks for and expires
 * overdue orders, freeing up any stock that was reserved for them.
 *
 * @param {number} [intervalMs=DEFAULT_INTERVAL_MS] - How often (in ms) the sweep runs after startup.
 * @returns {Function} A cleanup/stop function that clears both the initial delay timer and recurring interval.
 */

export const startOrderExpiryJob = (intervalMs = DEFAULT_INTERVAL_MS) => {
  // Overlap guard ("lock" flag) to prevent concurrent sweeps if a database/service
  // call takes longer than `intervalMs`.
  let isRunning = false;

  // Executes a single expiry sweep safely
  // without letting unhandled rejections crash the process.
  const runSweep = async () => {
    // Skip this tick if a previous sweep is still in progress.
    if (isRunning) return;
    // Mark the job as active before starting async work.
    isRunning = true;

    try {
      // Delegate the actual querying, status updates, and stock release to the service layer.
      const expiredCount = await expireOverdueOrdersService();
      // Only log activity when at least one order was expired
      // to keep logs quiet during idle intervals.
      if (expiredCount > 0) {
        console.log(
          `[OrderExpiryJob] Auto-cancelled ${expiredCount} expired order(s) and released reserved stock.`,
        );
      }
    } catch (error) {
      console.error("[OrderExpiryJob] Sweep error:", error?.message ?? error);
    } finally {
      // Always release the lock—whether the sweep succeeded or threw—so future sweeps can run.
      isRunning = false;
    }
  };

  /*
   * Schedule an initial sweep 5 seconds after startup rather than immediately at t=0.
   * This gives the app time to finish booting (DB connections, middleware, server binding)
   * before hitting the database with background work.
   */
  const startupTimer = setTimeout(runSweep, 5000);
  const intervalId = setInterval(runSweep, intervalMs);
  // Return a teardown/stop hook (useful for graceful shutdown or unit tests) to cancel pending timers.
  return () => {
    clearTimeout(startupTimer);
    clearInterval(intervalId);
  };
};
