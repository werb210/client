// server/middleware/session.ts - Secure session management
import type { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";

// Use __Host- prefix for additional security in production
const COOKIE_NAME = process.env.NODE_ENV === 'production' ? "__Host-bf_session" : "bf_session";
const SESSION_TTL = 1000 * 60 * 60 * 24 * 7; // 7 days

declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
      regenerateSession?: () => void;
    }
  }
}

export function session(req: Request, res: Response, next: NextFunction) {
  let sessionId = req.cookies?.[COOKIE_NAME];
  
  if (!sessionId || !isValidSessionId(sessionId)) {
    sessionId = generateSecureSessionId();
    setSessionCookie(res, sessionId);
  }
  
  req.sessionId = sessionId;
  
  // Provide session regeneration function (for login/role changes)
  req.regenerateSession = () => {
    const newSessionId = generateSecureSessionId();
    setSessionCookie(res, newSessionId);
    req.sessionId = newSessionId;
    console.log('[SESSION] Regenerated session for security');
  };
  
  next();
}

function generateSecureSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

function setSessionCookie(res: Response, sessionId: string) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: SESSION_TTL,
    path: '/'
  };
  
  res.cookie(COOKIE_NAME, sessionId, cookieOptions);
}

function isValidSessionId(sessionId: string): boolean {
  return typeof sessionId === 'string' && 
         sessionId.length === 64 && 
         /^[a-f0-9]{64}$/.test(sessionId);
}