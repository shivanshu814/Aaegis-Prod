import { IncomingMessage, ServerResponse } from "http";

// Get allowed origins from environment variable
export const getAllowedOrigins = (): string[] => {
  const origins = process.env.ALLOWED_ORIGINS || "http://localhost:3000";
  return origins.split(",").map((origin) => origin.trim());
};

// Check if origin is allowed
export const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return false;
  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.includes(origin);
};

// Set CORS headers on response
export const setCorsHeaders = (
  req: IncomingMessage,
  res: ServerResponse
): void => {
  const origin = req.headers.origin;

  // Check if origin is allowed
  if (origin && isOriginAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
};

// Handle CORS preflight request
export const handleCorsPreFlight = (
  req: IncomingMessage,
  res: ServerResponse
): boolean => {
  if (req.method === "OPTIONS") {
    setCorsHeaders(req, res);
    res.statusCode = 204;
    res.end();
    return true;
  }
  return false;
};
