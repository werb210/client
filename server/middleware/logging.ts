// server/middleware/logging.ts - Secure request logging
import type { Request, Response, NextFunction } from "express";

interface LogData {
  timestamp: string;
  method: string;
  path: string;
  ip: string;
  userAgent: string;
  sessionId?: string;
  duration?: number;
  status?: number;
}

export function secureLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  // Capture original res.end to log response details
  const originalEnd = res.end;
  
  res.end = function(chunk?: any, encoding?: any) {
    const duration = Date.now() - start;
    
    const logData: LogData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: sanitizePath(req.path),
      ip: getClientIP(req),
      userAgent: req.headers['user-agent']?.substring(0, 100) || 'unknown',
      sessionId: req.sessionId?.substring(0, 8) + '...',
      duration,
      status: res.statusCode
    };
    
    // Log level based on status code
    if (res.statusCode >= 400) {
      console.error('[REQUEST ERROR]', JSON.stringify(logData));
    } else if (req.path.startsWith('/api')) {
      console.log('[API REQUEST]', JSON.stringify(logData));
    }
    
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
}

function sanitizePath(path: string): string {
  // Remove sensitive path parameters
  return path.replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/[uuid]')
             .replace(/\/\d+/g, '/[id]')
             .substring(0, 200); // Limit path length
}

function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'] as string;
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] as string || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         'unknown';
}