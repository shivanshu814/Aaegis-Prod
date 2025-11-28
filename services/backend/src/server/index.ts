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
const port = process.env.PORT ? parseInt(process.env.PORT) : 4000;

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
