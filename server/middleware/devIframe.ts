import type { Request, Response, NextFunction } from "express";

const REPLIT_ANCESTORS = ["'self'", "https://replit.com", "*.replit.com", "*.replit.dev", "*.id.repl.co"];

export function allowReplitIframe(req: Request, res: Response, next: NextFunction) {
  // Dev-only guard: off in production
  if (process.env.NODE_ENV === "production") return next();
  
  // Override the header method to prevent X-Frame-Options from being set
  const originalHeader = res.header;
  res.header = function(field: any, val?: any) {
    if (typeof field === 'string' && field.toLowerCase() === 'x-frame-options') {
      return this; // Skip setting X-Frame-Options entirely
    }
    return originalHeader.call(this, field, val);
  };
  
  // Also override setHeader method
  const originalSetHeader = res.setHeader;
  res.setHeader = function(name: any, value: any) {
    if (typeof name === 'string' && name.toLowerCase() === 'x-frame-options') {
      return this; // Skip setting X-Frame-Options entirely
    }
    return originalSetHeader.call(this, name, value);
  };
  
  // Remove any existing X-Frame-Options header
  res.removeHeader("X-Frame-Options");
  
  // Override CSP setting to include frame-ancestors
  const originalSetHeader2 = res.setHeader;
  res.setHeader = function(name: any, value: any) {
    if (typeof name === 'string' && name.toLowerCase() === 'x-frame-options') {
      return this; // Skip X-Frame-Options
    }
    if (typeof name === 'string' && name.toLowerCase() === 'content-security-policy') {
      // Add frame-ancestors to the CSP
      const fa = "frame-ancestors " + REPLIT_ANCESTORS.join(" ") + ";";
      const cspValue = String(value);
      if (!/frame-ancestors/i.test(cspValue)) {
        value = `${cspValue.trim()} ${fa}`;
      }
    }
    return originalSetHeader2.call(this, name, value);
  };
  
  next();
}