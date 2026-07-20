/**
 * Shared observability service — single integration point for error reporting.
 *
 * Currently wraps console.error. To migrate to Sentry (or equivalent):
 *   1. npm install @sentry/react
 *   2. Sentry.init({ dsn: '...' }) en main.tsx antes de <RouterProvider />
 *   3. Reemplazar los cuerpos de captureError y captureHttpError:
 *        captureError  → Sentry.captureException(error, { extra: context })
 *        captureHttpError → Sentry.captureMessage(`HTTP ${status}`, 'error', { extra: { url, method } })
 */

export interface MonitoringContext {
  [key: string]: unknown;
}

function captureError(error: Error, context?: MonitoringContext): void {
  console.error('[monitoring]', error.message, context ?? '');
}

function captureHttpError(status: number | undefined, url?: string, method?: string): void {
  console.error('[monitoring:http]', { status, url, method });
}

export const monitoring = { captureError, captureHttpError };
