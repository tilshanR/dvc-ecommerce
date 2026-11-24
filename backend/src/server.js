// import "dotenv/config";
// import app from "./app.js";
// import connectDB from "./config/db.js";
// import { startOrderExpiryJob } from "./modules/order/orderExpiryJob.js";

// const PORT = process.env.PORT || 8000;

// await connectDB();
// // Start background job that auto-cancels expired unpaid orders every 60s
// const stopOrderExpiryJob = startOrderExpiryJob();

// const server = app.listen(PORT, () => {
//   console.log(`DVC Store server running on port ${PORT}`);
// });
// // Guard so pressing Ctrl+C twice doesn't trigger shutdown logic multiple times
// let isShuttingDown = false;

// const shutdown = () => {
//   stopOrderExpiryJob();
//   server.close(() => process.exit(0));
// };

// process.on("SIGINT", shutdown);
// process.on("SIGTERM", shutdown);
import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";
import connectDB from "./config/db.js";
import { startOrderExpiryJob } from "./modules/order/orderExpiryJob.js";

const PORT = process.env.PORT || 8000;

await connectDB();

// Start background job that auto-cancels expired unpaid orders every 60s
const stopOrderExpiryJob = startOrderExpiryJob();

const server = app.listen(PORT, () => {
  console.log(`DVC Store server running on port ${PORT}`);
});

// Guard so pressing Ctrl+C twice doesn't trigger shutdown logic multiple times
let isShuttingDown = false;

const shutdown = (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n${signal} received. Shutting down gracefully...`);

  //  Stop the background expiry timers so Node doesn't stay alive waiting for them
  stopOrderExpiryJob();

  // Safety fallback: force exit after 10s if an open HTTP/DB socket refuses to close
  const forceExitTimer = setTimeout(() => {
    console.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10000);
  forceExitTimer.unref(); // Allows Node to exit earlier if everything closes before 10s

  //  Stop accepting new HTTP requests, finish active ones, then close MongoDB
  server.close(async () => {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed. Exiting cleanly.");
      process.exit(0);
    } catch (err) {
      console.error("Error closing MongoDB connection:", err);
      process.exit(1);
    }
  });
};

// Immediately close idle browser keep-alive sockets so restarts don't stall
server.closeIdleConnections?.();

// SIGINT = Ctrl+C in terminal | SIGTERM = stop/restart signal from hosting/PM2/Docker
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
