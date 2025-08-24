import { type RequestHandler, Request, Response, NextFunction } from "express";

/**
 * Use both CSP (frame-ancestors) AND X-Frame-Options for auditors that still check it.
 * Strict policy; loosen only if you truly need embeds.
 */
export const securityHeaders = (): RequestHandler[] => [
  (req: Request, res: Response, next: NextFunction) => {
    // X-Frame-Options for audit compliance
    res.header('X-Frame-Options', 'DENY');
    
    // X-Content-Type-Options
    res.header('X-Content-Type-Options', 'nosniff');
    
    // X-XSS-Protection (legacy but still checked by audits)
    res.header('X-XSS-Protection', '1; mode=block');
    
    // Referrer Policy
    res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Strict Transport Security (HSTS) in production only
    if (process.env.NODE_ENV === 'production') {
      res.header('Strict-Transport-Security', 'max-age=15552000; includeSubDomains; preload');
    }
    
    // Enhanced Content Security Policy
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' ws: wss: https: http:",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-src https://challenges.cloudflare.com"
    ];
    res.header('Content-Security-Policy', cspDirectives.join('; '));
    
    next();
  }
];