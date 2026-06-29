import * as Sentry from '@sentry/react'

/**
 * No-ops unless VITE_SENTRY_DSN is set, so local dev and CI never need a real
 * DSN. Call once, before the app renders.
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) return

  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_APP_ENV ?? 'development',
    sendDefaultPii: false,
  })
}

export { Sentry }
