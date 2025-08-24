import { Request, Response, NextFunction } from "express";

// Custom rate limiting implementation
const rateLimiters = new Map<string, Map<string, number[]>>();

function createRateLimit(windowMs: number, max: number, message: any = { ok: false, error: "Too many requests" }) {
  const limiterKey = `${windowMs}:${max}`;
  
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get or create limiter for this config
    if (!rateLimiters.has(limiterKey)) {
      rateLimiters.set(limiterKey, new Map());
    }
    const limiter = rateLimiters.get(limiterKey)!;
    
    // Clean up old entries
    for (const [ip, requests] of limiter.entries()) {
      const filteredRequests = requests.filter(time => time > windowStart);
      if (filteredRequests.length === 0) {
        limiter.delete(ip);
      } else {
        limiter.set(ip, filteredRequests);
      }
    }
    
    // Check current IP
    const requests = limiter.get(clientIP) || [];
    const recentRequests = requests.filter(time => time > windowStart);
    
    if (recentRequests.length >= max) {
      // Set rate limit headers
      res.setHeader('RateLimit-Limit', max);
      res.setHeader('RateLimit-Remaining', 0);
      res.setHeader('RateLimit-Reset', new Date(now + windowMs).toISOString());
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      
      return res.status(429).json(message);
    }
    
    recentRequests.push(now);
    limiter.set(clientIP, recentRequests);
    
    // Set rate limit headers
    res.setHeader('RateLimit-Limit', max);
    res.setHeader('RateLimit-Remaining', Math.max(0, max - recentRequests.length));
    res.setHeader('RateLimit-Reset', new Date(now + windowMs).toISOString());
    
    next();
  };
}

// A+ Security: Stricter rate limits for production hardening
export const rlGeneral = createRateLimit(15 * 60 * 1000, 100); // 15 min, 100 requests (A+ compliance)
export const rlAuth = createRateLimit(15 * 60 * 1000, 30, { ok: false, error: "Too many auth requests" }); // Stricter auth limiting
export const rlUpload = createRateLimit(10 * 60 * 1000, 20); // 10 min, 20 uploads (A+ compliance)
export const rlChatbot = createRateLimit(15 * 60 * 1000, 150, { ok: false, error: "Too many chatbot requests" }); // ~10 req/min
export const rlBot = createRateLimit(15 * 60 * 1000, 180, { ok: false, error: "Too many bot requests" });