import helmet from "helmet";
import type { RequestHandler } from "express";

// For iframe/preview compatibility, use NODE_ENV for security mode, not REPLIT_ENVIRONMENT
const IN_PROD = process.env.NODE_ENV === "production";
const allowDevIframe = !IN_PROD && (process.env.DEV_ALLOW_IFRAME === "true" || process.env.REPL_ID);

const frameAncestors = allowDevIframe
  ? ["'self'", "https://replit.com", "https://*.replit.com", "https://*.replit.dev", "https://*.id.repl.co"]
  : ["'none'"];

export const securityHeaders = (): RequestHandler[] => [
  helmet({
    // X-Frame-Options: Conditional based on environment
    frameguard: allowDevIframe ? { action: "sameorigin" } : { action: "deny" },

    contentSecurityPolicy: {
      useDefaults: false,  // Disable defaults to avoid conflicts
      directives: {
        "default-src": ["'self'"],
        "script-src": [
          "'self'", 
          "'unsafe-inline'", 
          "'unsafe-eval'",
          "https://www.googletagmanager.com",
          "https://www.google-analytics.com", 
          "https://replit.com"
        ],  // Allow external analytics and Replit scripts
        "style-src":  ["'self'", "'unsafe-inline'"],  // Allow inline styles for CSS-in-JS
        "img-src":    ["'self'", "data:", "blob:", "https:"],   // Allow https images
        "font-src":   ["'self'", "data:", "https:"],            // Allow external fonts
        "connect-src":[
          "'self'", 
          process.env.STAFF_API_URL ?? "", 
          "ws:", 
          "wss:", 
          "https:", 
          "https://www.google-analytics.com",
          "https://www.googletagmanager.com"
        ].filter(Boolean), // Add analytics connections
        
        // ✅ A+ Security in prod, dev-friendly iframe support in dev
        "frame-ancestors": frameAncestors,
              
        "object-src": ["'none'"],
        "base-uri":   ["'self'"],
        "form-action": ["'self'"],
        "frame-src":   ["https://www.googletagmanager.com"],  // Allow Google Tag Manager iframe
        "worker-src":  ["'self'", "blob:"],         // Allow service workers
        "manifest-src": ["'self'"]                  // Allow PWA manifest
      }
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    crossOriginEmbedderPolicy: false,  // Disable to fix compatibility issues
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: false,  // Disable to fix resource loading
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