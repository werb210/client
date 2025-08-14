import type { Request, Response, NextFunction } from "express";

const REPLIT_ANCESTORS = ["'self'", "https://replit.com", "*.replit.com", "*.replit.dev", "*.id.repl.co"];

export function allowReplitIframe(req: Request, res: Response, next: NextFunction) {
  // Dev-only guard: off in production
  if (process.env.NODE_ENV === "production") return next();
  // Remove X-Frame-Options and set CSP frame-ancestors to include Replit
  res.removeHeader("X-Frame-Options");
  const existing = String(res.getHeader("Content-Security-Policy") || "");
  const fa = "frame-ancestors " + REPLIT_ANCESTORS.join(" ") + ";";
  if (!existing) {
    res.setHeader("Content-Security-Policy", fa);
  } else if (!/frame-ancestors/i.test(existing)) {
    res.setHeader("Content-Security-Policy", `${existing.trim()} ${fa}`);
  }
  next();
}