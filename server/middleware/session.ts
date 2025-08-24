// server/middleware/session.ts - Secure session management
import type { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";

const COOKIE_NAME = "bf_session";
const SESSION_TTL = 1000 * 60 * 60 * 24 * 7; // 7 days

declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
    }
  }
}

export function session(req: Request, res: Response, next: NextFunction) {
  let sessionId = req.cookies?.[COOKIE_NAME];
  
  if (!sessionId || !isValidSessionId(sessionId)) {
    // Generate new secure session ID
    sessionId = crypto.randomBytes(32).toString('hex');
    
    res.cookie(COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_TTL,
      path: '/'
    });
  }
  
  req.sessionId = sessionId;
  next();
}

function isValidSessionId(sessionId: string): boolean {
  return typeof sessionId === 'string' && 
         sessionId.length === 64 && 
         /^[a-f0-9]{64}$/.test(sessionId);
}