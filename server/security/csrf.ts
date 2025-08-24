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
  const isGet = req.method === "GET" || req.method === "HEAD";
  if (isGet && !req.cookies?.[CSRF_COOKIE]) {
    const token = crypto.randomBytes(32).toString("base64url");
    
    // Set CSRF cookie (accessible to JavaScript for header inclusion)
    res.cookie(CSRF_COOKIE, token, { 
      httpOnly: false, // Must be accessible to JS for header inclusion
      secure: true, // Always secure for production-ready config
      sameSite: "lax", 
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 // 24 hours
    });
    
    // Echo token in response header for client to read
    res.setHeader("x-csrf-token", token);
    req.csrfToken = token;
  }
  
  next();
}

export function requireCsrf(req: Request, res: Response, next: NextFunction) {
  const method = req.method.toUpperCase();
  const needsCheck = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  // Dev-only minimal bypass for explicit test routes
  if (process.env.NODE_ENV !== "production") {
    const devBypass = req.path.startsWith("/__dev/allow-nocsrf");
    if (devBypass) return next();
  }

  if (!needsCheck) return next();

  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = (req.get("x-csrf-token") || req.get("X-CSRF-Token"))?.trim();
  
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