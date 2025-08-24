// server/index-secure-final.ts - Production-ready secure server
import { app } from "./app";
import { harden } from "./security";
import { setupHardenedRoutes } from "./routes/hardened";
import cfg from "./config";

// Apply comprehensive security hardening
harden(app);

// Setup all hardened routes with CSRF, validation, and logging
setupHardenedRoutes(app);

// Fallback for SPA routing - serve index.html for non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/csp-report')) {
    return next(); // Let API routes handle themselves
  }
  res.sendFile('index.html', { root: 'dist' });
});

// Start production-ready server
const PORT = cfg.port;
const server = app.listen(PORT, () => {
  console.log(`🔒 [PRODUCTION] Boreal Client Portal - Secure Server`);
  console.log(`📡 [PRODUCTION] Server listening on port ${PORT}`);
  console.log(`🛡️  [PRODUCTION] Security features active:`);
  console.log(`   ✅ CSRF Protection`);
  console.log(`   ✅ Session Management (__Host- cookies)`);
  console.log(`   ✅ Input Validation (Zod schemas)`);
  console.log(`   ✅ Enhanced File Upload Security`);
  console.log(`   ✅ CSP without unsafe-inline`);
  console.log(`   ✅ Rate Limiting (100 req/15min)`);
  console.log(`   ✅ Security Headers (Helmet)`);
  console.log(`   ✅ Request Logging & Audit Trail`);
  console.log(`   ✅ Error Boundary Protection`);
  console.log(`📡 [PRODUCTION] Proxying to Staff API: ${cfg.staffApiUrl}`);
});

// Graceful shutdown with cleanup
const gracefulShutdown = (signal: string) => {
  console.log(`🔒 [PRODUCTION] Received ${signal}, shutting down gracefully`);
  server.close(() => {
    console.log(`🔒 [PRODUCTION] Server closed successfully`);
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.log(`🔒 [PRODUCTION] Force closing server`);
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions securely
process.on('uncaughtException', (error) => {
  console.error('[CRITICAL] Uncaught exception:', {
    message: error.message,
    timestamp: new Date().toISOString()
  });
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason) => {
  console.error('[CRITICAL] Unhandled rejection:', {
    reason: reason instanceof Error ? reason.message : String(reason),
    timestamp: new Date().toISOString()
  });
});

export { app, server };