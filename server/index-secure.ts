// server/index-secure.ts - Secure server entry point
import { app } from "./app";
import { harden } from "./security";
import { setupSecureRoutes } from "./routes/secure";
import cfg from "./config";

// Apply security hardening
harden(app);

// Setup secure routes
setupSecureRoutes(app);

// CORS for allowed origins
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = cfg.allowedOrigins;
  
  if (allowedOrigins.some(allowed => 
    allowed === '*' || 
    origin === allowed || 
    (allowed.includes('*') && origin?.includes(allowed.replace('*.', '')))
  )) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Client-Session, X-CSRF-Token');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Handle preflight requests
app.options('*', (req, res) => {
  res.status(204).send();
});

// Fallback for SPA routing - serve index.html for non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next(); // Let API routes handle themselves
  }
  res.sendFile('index.html', { root: 'dist' });
});

// Start secure server
const PORT = cfg.port;
const server = app.listen(PORT, () => {
  console.log(`🔒 [SECURE] Client portal server listening on port ${PORT}`);
  console.log(`🛡️  [SECURE] Security hardening enabled`);
  console.log(`🔐 [SECURE] Session-based authentication active`);
  console.log(`📡 [SECURE] Proxying to Staff API: ${cfg.staffApiUrl}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔒 [SECURE] Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('🔒 [SECURE] Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔒 [SECURE] Received SIGINT, shutting down gracefully');
  server.close(() => {
    console.log('🔒 [SECURE] Server closed');
    process.exit(0);
  });
});

export { app, server };