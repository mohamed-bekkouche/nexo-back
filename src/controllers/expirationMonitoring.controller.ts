import cron from "node-cron";
import { processExpiredProducts } from "./productOrder.controller";

let cronJob: cron.ScheduledTask | null = null;
let isRunning = false;

export const startExpirationCron = (timezone: string = "UTC"): void => {
  if (isRunning) {
    console.log("⚠️  Expiration cron job is already running");
    return;
  }

  try {
    console.log("🚀 Starting expiration cron job - daily at midnight");

    cronJob = cron.schedule(
      "0 0 * * *", // Daily at midnight
      async () => {
        console.log(
          `⏰ Running expiration check at ${new Date().toISOString()}`
        );
        try {
          await processExpiredProducts();
          console.log("✅ Expiration check completed successfully");
        } catch (error) {
          console.error("❌ Error during expiration check:", error);
        }
      },
      {
        scheduled: true,
        timezone,
      }
    );

    isRunning = true;
    console.log("✅ Expiration cron job started successfully");

    // Run an initial check immediately
    runImmediateCheck();
  } catch (error) {
    console.error("❌ Failed to start expiration cron job:", error);
  }
};

/**
 * Stop the expiration cron job
 */
export const stopExpirationCron = (): void => {
  if (!isRunning || !cronJob) {
    console.log("⚠️  No expiration cron job is currently running");
    return;
  }

  try {
    cronJob.stop();
    cronJob = null;
    isRunning = false;
    console.log("🛑 Expiration cron job stopped successfully");
  } catch (error) {
    console.error("❌ Error stopping expiration cron job:", error);
  }
};

/**
 * Run an immediate expiration check (for testing or initial run)
 */
export const runImmediateCheck = async (): Promise<void> => {
  console.log("🔍 Running immediate expiration check...");
  try {
    await processExpiredProducts();
    console.log("✅ Immediate expiration check completed");
  } catch (error) {
    console.error("❌ Error during immediate expiration check:", error);
  }
};

export const getCronStatus = (): { isRunning: boolean } => {
  return { isRunning };
};

export const initializeExpirationMonitoring = (
  timezone: string = "UTC"
): void => {
  console.log("🔧 Initializing expiration monitoring system...");

  startExpirationCron(timezone);

  process.on("SIGINT", () => {
    console.log("🛑 Gracefully shutting down expiration monitoring...");
    stopExpirationCron();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("🛑 Gracefully shutting down expiration monitoring...");
    stopExpirationCron();
    process.exit(0);
  });
};

initializeExpirationMonitoring();
