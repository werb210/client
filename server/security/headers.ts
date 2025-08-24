import helmet from "helmet";
import type { RequestHandler } from "express";

// For iframe/preview compatibility, use NODE_ENV for security mode, not REPLIT_ENVIRONMENT
const IN_PROD = process.env.NODE_ENV === "production";
const ALLOW_IFRAME_ORIGINS = process.env.ALLOW_IFRAME_ORIGINS?.split(/\s+/) ?? [];

export const securityHeaders = (): RequestHandler[] => [
  helmet({
    // X-Frame-Options: Dev/Prod split for Replit preview compatibility
    frameguard: IN_PROD
      ? { action: "deny" }            // ✅ prod = DENY for A+ security
      : { action: "sameorigin" },     // ✅ dev = allow same-origin (Replit preview)

    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'"],  // Allow inline scripts for React/Vite
        "style-src":  ["'self'", "'unsafe-inline'"],  // Allow inline styles for CSS-in-JS
        "img-src":    ["'self'", "data:", "blob:"],   // Add blob: for generated images
        "font-src":   ["'self'", "data:"],            // Add data: for base64 fonts
        "connect-src":["'self'", process.env.STAFF_API_URL ?? "", "ws:", "wss:"].filter(Boolean), // Add WebSocket support
        
        // ✅ Dev/Prod split for frame-ancestors
        "frame-ancestors": IN_PROD
          ? ["'none'"]                                // ✅ prod = cannot be framed (A+ security)
          : (ALLOW_IFRAME_ORIGINS.length > 0
              ? ALLOW_IFRAME_ORIGINS                 // dev allowlist if specified
              : ["'self'", "https://replit.com", "https://*.replit.dev", "https://*.id.repl.co"]), // default Replit domains
              
        "object-src": ["'none'"],
        "base-uri":   ["'self'"]
      }
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-origin" },
    hsts: IN_PROD ? { maxAge: 15552000, includeSubDomains: true, preload: true } : false
  }),
  helmet.noSniff(),
  helmet.xssFilter(),
  ((req, res, next) => {
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), payment=(), accelerometer=(), autoplay=(), usb=()"
    );
    next();
  }) as RequestHandler
];