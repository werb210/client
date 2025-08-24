// server/security/csrf.ts - CSRF protection for session-based auth
import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";

const CSRF_COOKIE = "__Host-bf_csrf";

declare global {
  namespace Express {
    interface Request {
      csrfToken?: string;
    }
  }
}

export function issueCsrf(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[CSRF_COOKIE] || crypto.randomBytes(16).toString("hex");
  
  // Set CSRF cookie (accessible to JavaScript for header inclusion)
  res.cookie(CSRF_COOKIE, token, { 
    httpOnly: false, // Must be accessible to JS for header inclusion
    secure: process.env.NODE_ENV === 'production',
    sameSite: "lax", 
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  });
  
  // Echo token in response header for client to read
  res.setHeader("x-csrf-token", token);
  req.csrfToken = token;
  
  next();
}

export function requireCsrf(req: Request, res: Response, next: NextFunction) {
  if (req.method === "GET" || req.method === "HEAD") {
    return next(); // Skip CSRF for safe methods
  }
  
  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.get("x-csrf-token");
  
  // Allow requests without cookies in development/testing
  if (!cookieToken && process.env.NODE_ENV === 'development') {
    console.log('[CSRF] Development mode: allowing request without cookie');
    return next();
  }
  
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    console.warn('[CSRF] Blocked request:', {
      method: req.method,
      path: req.path,
      ip: req.ip,
      hasCookie: !!cookieToken,
      hasHeader: !!headerToken,
      tokensMatch: cookieToken === headerToken
    });
    
    return res.status(403).json({ 
      ok: false, 
      error: "CSRF token required",
      code: "CSRF_MISSING"
    });
  }
  
  next();
}