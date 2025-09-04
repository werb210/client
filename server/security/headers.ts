import helmet from "helmet";
import type { RequestHandler } from "express";

// For iframe/preview compatibility, use NODE_ENV for security mode, not REPLIT_ENVIRONMENT
const IN_PROD = process.env.NODE_ENV === "production";
const allowDevIframe = !IN_PROD && (process.env.DEV_ALLOW_IFRAME === "true" || process.env.REPL_ID);

const frameAncestors = allowDevIframe
  ? ["'self'", "https://replit.com", "https://*.replit.com", "https://*.replit.dev", "https://*.id.repl.co"]
  : ["'none'"];

// Modular CSP builder following the script's pattern
const buildCSP = () => {
  const scriptInline = IN_PROD ? "" : "'unsafe-inline'";
  const styleInline = IN_PROD ? "" : "'unsafe-inline'";
  
  const GOOGLE = [
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com", 
    "https://www.recaptcha.net",
    "https://www.google.com",
    "https://www.gstatic.com",
  ];

  const TWILIO_HTTP = [
    "https://sdk.twilio.com",
    "https://media.twiliocdn.com",
    "https://static.twilio.com",
  ];

  const REPLIT = [
    "https://*.replit.dev",
    "https://*.janeway.replit.dev", 
    "https://*.picard.replit.dev",
  ];

  return {
    "default-src": ["'self'"],
    "script-src": [
      "'self'", 
      scriptInline,
      "'unsafe-eval'", // Keep for dev tools
      ...GOOGLE,
      ...TWILIO_HTTP,
      "https://replit.com"
    ].filter(Boolean),
    "style-src": ["'self'", styleInline, "https://fonts.googleapis.com"].filter(Boolean),
    "font-src": ["'self'", "https://fonts.gstatic.com", "data:", "https:"],
    "img-src": ["'self'", "data:", "blob:", "https:"],
    "connect-src": [
      "'self'",
      process.env.STAFF_API_URL ?? "",
      "ws:", "wss:",
      "https:",
      ...GOOGLE,
      ...TWILIO_HTTP,
      ...REPLIT,
      "wss://*.twilio.com"
    ].filter(Boolean),
    "frame-src": ["'self'", ...GOOGLE.filter(url => url.includes('google'))],
    "frame-ancestors": frameAncestors,
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'"]
  };
};

export const securityHeaders = (): RequestHandler[] => [
  helmet({
    // X-Frame-Options: Conditional based on environment
    frameguard: allowDevIframe ? { action: "sameorigin" } : { action: "deny" },

    contentSecurityPolicy: {
      useDefaults: false,  // Disable defaults to avoid conflicts
      directives: buildCSP()
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
      "accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=*, geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), publickey-credentials-get=(), screen-wake-lock=(), usb=()"
    );
    next();
  }) as RequestHandler
];