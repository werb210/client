// Production-safe logging utility with sensitive data sanitization
const isProduction = process.env.NODE_ENV === 'production';

// Patterns to sanitize from logs (CRITICAL SECURITY FIX)
const SENSITIVE_PATTERNS = [
  /session[_-]?id[s]?[:\s=]+[a-f0-9]+/gi,
  /token[s]?[:\s=]+[\w.-]+/gi,
  /password[s]?[:\s=]+\S+/gi,
  /key[s]?[:\s=]+[\w.-]+/gi,
  /secret[s]?[:\s=]+[\w.-]+/gi,
  /authorization[:\s=]+[\w\s.-]+/gi,
  /bearer\s+[\w.-]+/gi,
  /api[_-]?key[s]?[:\s=]+[\w.-]+/gi,
  /email[:\s=]+[\w.-]+@[\w.-]+/gi,
  /phone[:\s=]+[\d\s\-\+\(\)]+/gi
];

function sanitizeData(data: any): any {
  if (!isProduction) return data; // Don't sanitize in development
  
  if (typeof data === 'string') {
    let sanitized = data;
    SENSITIVE_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });
    return sanitized;
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Sanitize sensitive keys
      if (/session|token|password|key|secret|email|phone|ssn|sin/i.test(key)) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeData(value);
      }
    }
    return sanitized;
  }
  
  return data;
}

export const logger = {
  info: (message: string, meta?: any) => {
    const sanitizedMeta = sanitizeData(meta);
    const sanitizedMessage = sanitizeData(message);
    
    if (isProduction) {
      // In production, only log essential info and errors
      return; // Skip info logs in production to reduce noise
    } else {
      console.log(`[INFO] ${sanitizedMessage}`, sanitizedMeta || '');
    }
  },
  
  warn: (message: string, meta?: any) => {
    const sanitizedMeta = sanitizeData(meta);
    const sanitizedMessage = sanitizeData(message);
    
    if (isProduction) {
      console.warn(JSON.stringify({ 
        level: 'warn', 
        message: sanitizedMessage, 
        meta: sanitizedMeta, 
        timestamp: new Date().toISOString() 
      }));
    } else {
      console.warn(`[WARN] ${sanitizedMessage}`, sanitizedMeta || '');
    }
  },
  
  error: (message: string, error?: any) => {
    const sanitizedMessage = sanitizeData(message);
    const sanitizedError = sanitizeData(error?.message || error);
    
    if (isProduction) {
      console.error(JSON.stringify({ 
        level: 'error', 
        message: sanitizedMessage, 
        error: sanitizedError,
        // Only include stack trace hash in production for debugging
        stackHash: error?.stack ? error.stack.slice(-10) : undefined,
        timestamp: new Date().toISOString() 
      }));
    } else {
      console.error(`[ERROR] ${sanitizedMessage}`, error || '');
    }
  },

  debug: (message: string, meta?: any) => {
    // Debug logs only in development
    if (!isProduction) {
      const sanitizedMeta = sanitizeData(meta);
      const sanitizedMessage = sanitizeData(message);
      console.log(`[DEBUG] ${sanitizedMessage}`, sanitizedMeta || '');
    }
  },

  // Security-specific logging methods
  securityEvent: (event: string, details?: any) => {
    const sanitizedDetails = sanitizeData(details);
    console.warn(JSON.stringify({ 
      level: 'SECURITY', 
      event, 
      details: sanitizedDetails, 
      timestamp: new Date().toISOString() 
    }));
  },
  
  auditLog: (action: string, userId?: string, details?: any) => {
    const sanitizedDetails = sanitizeData(details);
    console.info(JSON.stringify({ 
      level: 'AUDIT', 
      action, 
      userId: userId ? '[USER_ID_REDACTED]' : undefined, 
      details: sanitizedDetails,
      timestamp: new Date().toISOString() 
    }));
  }
};

// Safe console replacement for production (CRITICAL SECURITY FIX)
export const safeConsole = isProduction ? {
  log: (...args: any[]) => logger.debug(args.join(' ')),
  error: (...args: any[]) => logger.error(args.join(' ')),
  warn: (...args: any[]) => logger.warn(args.join(' ')),
  debug: (...args: any[]) => logger.debug(args.join(' ')),
  info: (...args: any[]) => logger.debug(args.join(' '))
} : console;