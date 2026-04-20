async function loadHapticsModule(options: {
  os: 'web' | 'ios' | 'android';
  impactRejects?: boolean;
  notificationRejects?: boolean;
}) {
  jest.resetModules();

  const impactAsync = options.impactRejects
    ? jest.fn().mockRejectedValue(new Error('impact failed'))
    : jest.fn().mockResolvedValue(undefined);
  const notificationAsync = options.notificationRejects
    ? jest.fn().mockRejectedValue(new Error('notification failed'))
    : jest.fn().mockResolvedValue(undefined);

  jest.doMock('react-native', () => ({
    Platform: { OS: options.os },
  }));

  jest.doMock('expo-haptics', () => ({
    ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
    NotificationFeedbackType: { Success: 'success' },
    impactAsync,
    notificationAsync,
  }));

  const mod = await import('@platform/haptics');
  return { ...mod, impactAsync, notificationAsync };
}

describe('haptics helpers', () => {
  it('lightTap is a no-op on web', async () => {
    const { lightTap, impactAsync } = await loadHapticsModule({ os: 'web' });
    await expect(lightTap()).resolves.toBeUndefined();
    expect(impactAsync).not.toHaveBeenCalled();
  });

  it('lightTap triggers Light impact on native', async () => {
    const { lightTap, impactAsync } = await loadHapticsModule({ os: 'ios' });
    await lightTap();
    expect(impactAsync).toHaveBeenCalledWith('light');
  });

  it('mediumTap triggers Medium impact on native', async () => {
    const { mediumTap, impactAsync } = await loadHapticsModule({ os: 'android' });
    await mediumTap();
    expect(impactAsync).toHaveBeenCalledWith('medium');
  });

  it('successPulse triggers Success notification on native', async () => {
    const { successPulse, notificationAsync } = await loadHapticsModule({ os: 'ios' });
    await successPulse();
    expect(notificationAsync).toHaveBeenCalledWith('success');
  });

  it('swallows native impact errors', async () => {
    const { lightTap } = await loadHapticsModule({ os: 'android', impactRejects: true });
    await expect(lightTap()).resolves.toBeUndefined();
  });

  it('swallows native notification errors', async () => {
    const { successPulse } = await loadHapticsModule({
      os: 'android',
      notificationRejects: true,
    });
    await expect(successPulse()).resolves.toBeUndefined();
  });
});
