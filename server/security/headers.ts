import helmet from "helmet";
import type { RequestHandler } from "express";

// For iframe/preview compatibility, use NODE_ENV for security mode, not REPLIT_ENVIRONMENT
const IN_PROD = process.env.NODE_ENV === "production";
const ALLOW_IFRAME_ORIGINS = process.env.ALLOW_IFRAME_ORIGINS?.split(/\s+/) ?? [];

export const securityHeaders = (): RequestHandler[] => [
  helmet({
    // X-Frame-Options: DENY for maximum security (A+ compliance)
    frameguard: { action: "deny" },   // ✅ Always DENY for A+ security

    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'"],  // Allow inline scripts for React/Vite
        "style-src":  ["'self'", "'unsafe-inline'"],  // Allow inline styles for CSS-in-JS
        "img-src":    ["'self'", "data:", "blob:"],   // Add blob: for generated images
        "font-src":   ["'self'", "data:"],            // Add data: for base64 fonts
        "connect-src":["'self'", process.env.STAFF_API_URL ?? "", "ws:", "wss:"].filter(Boolean), // Add WebSocket support
        
        // ✅ A+ Security: Always deny frame embedding
        "frame-ancestors": ["'none'"],              // ✅ Always deny for A+ security
              
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