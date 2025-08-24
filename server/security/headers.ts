import helmet from "helmet";
import type { RequestHandler } from "express";

export const securityHeaders = (): RequestHandler[] => [
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'"],
        "img-src": ["'self'","data:"],
        "font-src": ["'self'"],
        "connect-src": ["'self'", process.env.STAFF_API_URL ?? ""].filter(Boolean),
        "frame-ancestors": ["'none'"],
        "object-src": ["'none'"],
        "base-uri": ["'self'"]
      }
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-origin" },
    hsts: process.env.NODE_ENV === "production" ? { maxAge: 15552000, includeSubDomains: true, preload: true } : false
  }),
  helmet.frameguard({ action: "deny" }),
  helmet.noSniff(),
  // Legacy XSS header helps some scanners; real XSS is mitigated by CSP + validation.
  helmet.xssFilter(),
  // Permissions-Policy (a.k.a. Feature-Policy successor)
  ((req, res, next) => { 
    res.setHeader("Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), payment=(), accelerometer=(), autoplay=(), usb=()"
    );
    next();
  }) as RequestHandler
];