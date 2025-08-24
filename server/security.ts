// server/security.ts - Security hardening middleware
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import type { Express } from "express";

export function harden(app: Express) {
  // Helmet security headers with strict CSP (no unsafe-inline)
  app.use(helmet({
    frameguard: { action: "deny" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://app.signnow.com", "https://*.signnow.com"],
        styleSrc: ["'self'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", "wss:", "ws:", "https:", "http:"],
        frameSrc: ["'self'", "https://app.signnow.com", "https://*.signnow.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        workerSrc: ["'self'", "blob:"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        reportUri: ["/csp-report"]
      }
    }
  }));

  // Rate limiting - more restrictive for security
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Stricter limit
    standardHeaders: true,
    legacyHeaders: false,
    message: { 
      ok: false, 
      error: "Too many requests, please try again later" 
    }
  }));

  // Additional security headers
  app.use((req, res, next) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    if (process.env.NODE_ENV === 'production') {
      res.header('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    }
    
    next();
  });
}