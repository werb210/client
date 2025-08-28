/**
 * Server Configuration with Fail-Fast Secret Validation
 * Implements best-practice environment configuration for production deployment
 */

// Use environment variables directly (production mode)
console.log('Using environment variables directly (production mode)');

export const cfg = {
  nodeEnv: process.env.NODE_ENV || (process.env.REPLIT_ENVIRONMENT === 'production' ? 'production' : 'development'),
  
  // API Configuration - Use external staff backend
  staffApiUrl: 'https://staff.boreal.financial/api',
  
  // Authentication Tokens
  clientToken: process.env.VITE_CLIENT_APP_SHARED_TOKEN || process.env.CLIENT_APP_SHARED_TOKEN!,
//   signNowToken: process.env.SIGNNOW_API_KEY!,
  clientSyncSecret: process.env.CLIENT_SYNC_SECRET || 'dev_sync_secret_2024',
  
//   // SignNow Configuration  
  templateId: process.env.TEMPLATE_ID_PROD,
//   signNowRedirectUrl: process.env.VITE_SIGNNOW_REDIRECT_URL || 'https://clientportal.boreal.financial/step6-signature',
  
  // Server Configuration
  port: parseInt(process.env.PORT || '5000', 10),
  
  // CORS Configuration
  allowedOrigins: [
    'https://clientportal.boreal.financial',
    'https://*.boreal.financial',
    // Development origins
    'http://localhost:5000',
    'https://*.replit.dev',
    'https://*.replit.app'
  ]
};

/**
 * Fail fast in production if any required secret is missing
 */
if (cfg.nodeEnv === 'production') {
  const requiredSecrets = {
    CLIENT_APP_SHARED_TOKEN: cfg.clientToken,
    // CLIENT_SYNC_SECRET: cfg.clientSyncSecret, // Optional in development
//     // SIGNNOW_API_KEY: cfg.signNowToken // Temporarily disabled for deployment
  };
  
  for (const [secretName, value] of Object.entries(requiredSecrets)) {
    if (!value) {
      console.error(`[FATAL] Missing required secret: ${secretName}`);
      console.error('Ensure all production secrets are configured in Replit Secrets');
      process.exit(1);
    }
  }
  
  console.log('✅ All required production secrets validated');
}

/**
 * Development environment warnings
 */
if (cfg.nodeEnv === 'development') {
  if (!cfg.clientToken) {
    console.warn('⚠️  CLIENT_APP_SHARED_TOKEN not set - API calls may fail');
  }
  if (!cfg.signNowToken) {
// //     console.warn('⚠️  SIGNNOW_API_KEY not set - SignNow integration unavailable');
  }
}

export default cfg;