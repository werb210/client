import * as Sentry from "@sentry/react";

// Initialize Sentry for error monitoring
export function initSentry() {
  // Only initialize in production or if SENTRY_DSN is provided
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (dsn) {
    Sentry.init({
      dsn,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          // Capture 10% of all sessions,
          // but 100% of sessions with an error
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      environment: import.meta.env.MODE,
      // Performance Monitoring
      tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
      // Privacy
      beforeSend(event) {
        // Don't send events containing sensitive information
        if (event.exception) {
          const error = event.exception.values?.[0];
          if (error?.value?.includes('password') || error?.value?.includes('token')) {
            return null;
          }
        }
        return event;
      },
    });
    
    console.log("✅ Sentry error monitoring initialized");
  } else {
    console.log("⚠️ Sentry DSN not provided - error monitoring disabled");
  }
}

export { Sentry };