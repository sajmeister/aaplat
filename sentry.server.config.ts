import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Performance monitoring
  tracesSampleRate: 1.0,
  
  // Debug mode for development
  debug: process.env.NODE_ENV === 'development',
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Filter out development and testing errors
  beforeSend(event) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Sentry Server Event:', event);
    }
    return event;
  },
}); 