import type { Request, Response, NextFunction } from "express";
import helmet from "helmet";

const replitAncestors = [
  "'self'",
  "https://replit.com",
  "*.replit.com",
  "*.replit.dev",
  "*.id.repl.co",
];

export const stripXfo = (_req: Request, res: Response, next: NextFunction) => {
  // Remove any upstream frame headers that break the Replit iframe
  res.removeHeader("X-Frame-Options");
  
  // Override res.header method to prevent X-Frame-Options from being set
  const originalHeader = res.header;
  res.header = function(field: any, val?: any) {
    if (typeof field === 'string' && field.toLowerCase() === 'x-frame-options') {
      return this; // Skip setting X-Frame-Options
    }
    return originalHeader.call(this, field, val);
  };
  
  next();
};

// Helmet configuration that keeps embedding open in dev
export const replitHelmet = helmet({
  frameguard: false,                      // don't set X-Frame-Options
  crossOriginOpenerPolicy: false as any,  // allow iframe embedding
  crossOriginEmbedderPolicy: false,       // allow third-party iframes/resources
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "frame-ancestors": replitAncestors,
    },
  },
});