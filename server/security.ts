// server/security.ts - Security hardening middleware
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import type { Express } from "express";

export function harden(app: Express) {
  const isProd = process.env.NODE_ENV === 'production';
  const isReplit = !!process.env.REPLIT_ENVIRONMENT || !!process.env.REPL_ID || !!process.env.REPL_SLUG;

  // Allow Replit iframe only in dev; keep strict in prod
  const frameAncestors = isProd
    ? ["'self'"]
    : ["'self'", "https://replit.com", "https://*.replit.dev"];

  app.use(helmet({
    // X-Frame-Options for compatibility (CSP frame-ancestors is more secure)
    frameguard: { action: isProd ? 'deny' : 'sameorigin' },
    crossOriginEmbedderPolicy: false, // needed for some dev toolchains
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "img-src": ["'self'", "data:", "https:"],
        "style-src": ["'self'", "'unsafe-inline'", "https:"],
        "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"],
        "connect-src": ["'self'", "https:", "ws:", "wss:"],
        "frame-ancestors": frameAncestors,
        "frame-src": ["'self'", "https:"],
        "object-src": ["'none'"],
        "media-src": ["'self'"],
        "worker-src": ["'self'", "blob:"],
        "base-uri": ["'self'"],
        "form-action": ["'self'"]
      }
    }
  }));

  // X-Frame-Options now managed by helmet frameguard above

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