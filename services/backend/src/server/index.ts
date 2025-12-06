import dotenv from "dotenv";
dotenv.config();

import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import http from "http";
import { connectDB } from "../db";
import { startListener, stopListener } from "../indexer/listener";
import { appRouter } from "../router";
import {
  getAllowedOrigins,
  handleCorsPreFlight,
  setCorsHeaders,
} from "../utils/cors";
import { logger } from "../utils/logger";

// ============================================
// AUTO-RESTART & ERROR HANDLING CONFIGURATION
// ============================================
const MAX_RESTART_ATTEMPTS = 3;
const RESTART_DELAY_MS = 5000; // 5 seconds delay before restart
const RESTART_WINDOW_MS = 30000; // Reset restart count after 30 seconds of stability

let restartAttempts = 0;
let lastRestartTime = Date.now();
let isShuttingDown = false;
let httpServer: http.Server | null = null;

// Port to run the server on
// Render's internal health-check can target port 10000, so default to 10000
const port = process.env.PORT ? parseInt(process.env.PORT) : 10000;

// Create tRPC HTTP handler
const tRPCHandler = createHTTPHandler({
  router: appRouter,
  createContext: () => ({}),
});

// Log allowed CORS origins
const allowedOrigins = getAllowedOrigins();

/**
 * Gracefully shutdown the server
 */
async function gracefulShutdown(reason: string): Promise<void> {
  if (isShuttingDown) {
    logger.warn("Shutdown already in progress...");
    return;
  }

  isShuttingDown = true;
  logger.warn(`🛑 Initiating graceful shutdown: ${reason}`);

  try {
    // Stop the listener first
    stopListener();
    logger.info("Listener stopped");

    // Close the HTTP server
    if (httpServer) {
      await new Promise<void>((resolve) => {
        httpServer!.close(() => {
          logger.info("HTTP server closed");
          resolve();
        });
      });
      httpServer = null;
    }
  } catch (error) {
    logger.error("Error during graceful shutdown:", error);
  }
}

/**
 * Create and start the HTTP server
 */
function createHttpServer(): http.Server {
  const server = http.createServer((req, res) => {
    // Set CORS headers
    setCorsHeaders(req, res);

    // Handle preflight requests
    if (handleCorsPreFlight(req, res)) {
      return;
    }

    // Quick HTTP health-check for Render's internal probe.
    // Render's internal health-check hits :10000/v1 with a GET; respond 200 JSON.
    if (req.url && req.method === "GET" && (req.url === "/v1" || req.url === "/v1/")) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ status: "ok", message: "health check" }));
      return;
    }

    // Handle tRPC requests
    if (req.url && req.url.startsWith("/v1")) {
      req.url = req.url.replace(/^\/v1/, "") || "/";
      return tRPCHandler(req, res);
    }

    res.statusCode = 404;
    res.end();
  });

  return server;
}

/**
 * Attempt to restart the server
 */
async function attemptRestart(reason: string): Promise<void> {
  const now = Date.now();

  // Reset restart counter if we've been stable for a while
  if (now - lastRestartTime > RESTART_WINDOW_MS) {
    restartAttempts = 0;
  }

  restartAttempts++;
  lastRestartTime = now;

  logger.warn(`🔄 Restart attempt ${restartAttempts}/${MAX_RESTART_ATTEMPTS} - Reason: ${reason}`);

  if (restartAttempts > MAX_RESTART_ATTEMPTS) {
    logger.error(`❌ Max restart attempts (${MAX_RESTART_ATTEMPTS}) exceeded. Exiting...`);
    process.exit(1);
  }

  // Wait before restarting
  logger.info(`⏳ Waiting ${RESTART_DELAY_MS / 1000}s before restart...`);
  await new Promise(resolve => setTimeout(resolve, RESTART_DELAY_MS));

  // Reset shutdown flag and restart
  isShuttingDown = false;

  try {
    await startServer();
    logger.info("✅ Server restarted successfully");
  } catch (error) {
    logger.error("❌ Failed to restart server:", error);
    await attemptRestart("Restart failed");
  }
}

/**
 * Handle uncaught exceptions
 */
process.on("uncaughtException", async (error: Error) => {
  logger.error("💥 UNCAUGHT EXCEPTION:", error.message);
  logger.error(error.stack || "No stack trace available");

  await gracefulShutdown("Uncaught Exception");
  await attemptRestart(`Uncaught Exception: ${error.message}`);
});

/**
 * Handle unhandled promise rejections
 */
process.on("unhandledRejection", async (reason: unknown, _promise: Promise<unknown>) => {
  const errorMessage = reason instanceof Error ? reason.message : String(reason);
  logger.error("💥 UNHANDLED PROMISE REJECTION:", errorMessage);

  if (reason instanceof Error && reason.stack) {
    logger.error(reason.stack);
  }

  await gracefulShutdown("Unhandled Promise Rejection");
  await attemptRestart(`Unhandled Rejection: ${errorMessage}`);
});

/**
 * Handle SIGTERM signal for graceful shutdown
 */
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received. Shutting down gracefully");
  await gracefulShutdown("SIGTERM signal");
  logger.info("Process terminated");
  process.exit(0);
});

/**
 * Handle SIGINT signal (Ctrl+C)
 */
process.on("SIGINT", async () => {
  logger.info("SIGINT received. Shutting down gracefully");
  await gracefulShutdown("SIGINT signal");
  logger.info("Process terminated");
  process.exit(0);
});

/**
 * Start the server and connect to DB
 */
async function startServer(): Promise<void> {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info("✅ Database connected successfully");

    // Start the protocol state listener
    startListener();
    logger.info("✅ Listener started successfully");

    // Create and start HTTP server
    httpServer = createHttpServer();
    httpServer.listen(port);

    // Log server information
    logger.info(`🚀 Server running at http://localhost:${port}`);
    logger.info(`📡 tRPC endpoint: http://localhost:${port}/v1`);
    logger.info(`🔒 CORS enabled for origins: ${allowedOrigins.join(", ")}`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("❌ Failed to initialize server:", errorMessage);
    throw error;
  }
}

// ============================================
// INITIALIZE SERVER
// ============================================
logger.info("🏁 Starting Aegis Backend Server...");

startServer().catch(async (error) => {
  logger.error("❌ Initial server start failed:", error);
  await attemptRestart("Initial startup failed");
});
