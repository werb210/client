// Production-safe logging utility
const isProduction = process.env.NODE_ENV === 'production';

export const logger = {
  info: (message: string, meta?: any) => {
    if (isProduction) {
      // In production, use structured logging
      console.log(JSON.stringify({ level: 'info', message, meta, timestamp: new Date().toISOString() }));
    } else {
      console.log(`[INFO] ${message}`, meta || '');
    }
  },
  
  warn: (message: string, meta?: any) => {
    if (isProduction) {
      console.warn(JSON.stringify({ level: 'warn', message, meta, timestamp: new Date().toISOString() }));
    } else {
      console.warn(`[WARN] ${message}`, meta || '');
    }
  },
  
  error: (message: string, error?: any) => {
    if (isProduction) {
      console.error(JSON.stringify({ 
        level: 'error', 
        message, 
        error: error?.message || error, 
        stack: error?.stack,
        timestamp: new Date().toISOString() 
      }));
    } else {
      console.error(`[ERROR] ${message}`, error || '');
    }
  },

  debug: (message: string, meta?: any) => {
    // Debug logs only in development
    if (!isProduction) {
      console.log(`[DEBUG] ${message}`, meta || '');
    }
  }
};