import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import { logger } from "../utils/logger";
import { appRouter } from "../router";
import {
  setCorsHeaders,
  handleCorsPreFlight,
  getAllowedOrigins,
} from "../utils/cors";

// Port to run the server on
// Render's internal health-check can target port 10000, so default to 10000
// when PORT is not provided by the environment.
const port = process.env.PORT ? parseInt(process.env.PORT) : 10000;

// Create tRPC HTTP handler
const tRPCHandler = createHTTPHandler({
  router: appRouter,
  createContext: () => ({}),
});

// Log allowed CORS origins
const allowedOrigins = getAllowedOrigins();

// Create HTTP server
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

// Start the server
server.listen(port);

// Log server information
logger.info(`Server running at http://localhost:${port}`);
logger.info(`tRPC endpoint: http://localhost:${port}/v1`);
logger.info(`CORS enabled for origins: ${allowedOrigins.join(", ")}`);

// Handle SIGTERM signal
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully");
  server.close(() => {
    logger.info("Process terminated");
  });
});
