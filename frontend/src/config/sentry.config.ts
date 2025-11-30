import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: 1.0,
});
