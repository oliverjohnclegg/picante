jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      name: 'Picante',
      version: '0.1.0',
    },
  },
}));

import { __sanitizeEventForTests } from '@platform/telemetry';

describe('telemetry sanitizer', () => {
  it('strips user, userId tag, and noisy breadcrumbs', () => {
    const event = {
      message: 'crash',
      user: { id: 'abc', email: 'me@example.com' },
      tags: { userId: '123', release: 'x' },
      breadcrumbs: [
        { category: 'console', message: 'noise' },
        { category: 'ui.input', message: 'typed' },
        { category: 'navigation', message: 'moved' },
      ],
    };
    const result = __sanitizeEventForTests(event) as Record<string, unknown>;
    expect(result.user).toBeUndefined();
    expect((result.tags as Record<string, unknown>).userId).toBeUndefined();
    expect((result.tags as Record<string, unknown>).release).toBe('x');
    expect((result.breadcrumbs as Array<{ category: string }>).length).toBe(1);
    expect((result.breadcrumbs as Array<{ category: string }>)[0]?.category).toBe('navigation');
  });

  it('returns null when given null', () => {
    expect(__sanitizeEventForTests(null as unknown as Record<string, unknown>)).toBeNull();
  });

  it('is a no-op for events without user data', () => {
    const event = { message: 'crash' };
    expect(__sanitizeEventForTests(event)).toEqual({ message: 'crash' });
  });
});

describe('telemetry init', () => {
  it('is a no-op when DSN is unset', async () => {
    jest.resetModules();
    delete process.env.EXPO_PUBLIC_SENTRY_DSN;
    const importSpy = jest.fn();
    jest.doMock('@sentry/react-native', importSpy, { virtual: true });
    const mod = await import('@platform/telemetry');
    await mod.initTelemetry();
    expect(importSpy).not.toHaveBeenCalled();
    expect(mod.getErrorBoundary()).toBeNull();
  });
});
