import Constants from 'expo-constants';

type SentryLike = {
  init: (options: Record<string, unknown>) => void;
  ErrorBoundary: React.ComponentType<{ children: React.ReactNode; fallback?: unknown }>;
  captureException: (err: unknown) => void;
};

type TelemetryState = {
  initialized: boolean;
  module: SentryLike | null;
};

const state: TelemetryState = {
  initialized: false,
  module: null,
};

function sanitizeEvent(event: Record<string, unknown>): Record<string, unknown> | null {
  if (!event) return null;
  const sanitized = { ...event };
  delete sanitized.user;
  if (Array.isArray(sanitized.breadcrumbs)) {
    sanitized.breadcrumbs = (sanitized.breadcrumbs as Array<Record<string, unknown>>).filter(
      (b) => b?.category !== 'console' && b?.category !== 'ui.input',
    );
  }
  const tags = sanitized.tags as Record<string, unknown> | undefined;
  if (tags) {
    const cleaned = { ...tags };
    delete cleaned.userId;
    delete cleaned.user_id;
    sanitized.tags = cleaned;
  }
  return sanitized;
}

export async function initTelemetry(): Promise<void> {
  if (state.initialized) return;
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    state.initialized = true;
    return;
  }

  try {
    const mod = (await import('@sentry/react-native')) as unknown as SentryLike;
    state.module = mod;
    const release = `${
      Constants.expoConfig?.name ?? 'picante'
    }@${Constants.expoConfig?.version ?? '0.0.0'}`;
    mod.init({
      dsn,
      release,
      enableAutoSessionTracking: true,
      sendDefaultPii: false,
      beforeSend: (event: Record<string, unknown>) => sanitizeEvent(event),
    });
  } catch {
    // Sentry is optional — failing to load must never crash the app.
  } finally {
    state.initialized = true;
  }
}

export function getErrorBoundary(): SentryLike['ErrorBoundary'] | null {
  return state.module?.ErrorBoundary ?? null;
}

export function captureException(err: unknown): void {
  state.module?.captureException(err);
}

export function __resetTelemetryForTests(): void {
  state.initialized = false;
  state.module = null;
}

export { sanitizeEvent as __sanitizeEventForTests };
