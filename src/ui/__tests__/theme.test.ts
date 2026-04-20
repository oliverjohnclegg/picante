import {
  colors,
  elevation,
  motion,
  radii,
  spacing,
  suitColors,
  suitDeepColors,
  typography,
} from '@ui/theme';

describe('theme tokens', () => {
  it('defines suit color maps for all suits', () => {
    expect(suitColors).toMatchObject({
      hearts: colors.green,
      diamonds: colors.orange,
      spades: colors.purple,
      clubs: colors.yellow,
    });
    expect(suitDeepColors).toMatchObject({
      hearts: colors.greenDeep,
      diamonds: colors.orangeDeep,
      spades: colors.purpleDeep,
      clubs: colors.yellowDeep,
    });
  });

  it('has positive spacing, radii, and motion values', () => {
    for (const value of Object.values(spacing)) expect(value).toBeGreaterThan(0);
    for (const value of Object.values(radii)) expect(value).toBeGreaterThan(0);
    for (const value of Object.values(motion)) expect(value).toBeGreaterThan(0);
  });

  it('contains expected typography presets', () => {
    expect(typography.displayXL.fontFamily).toContain('Fraunces');
    expect(typography.bodyMD.fontFamily).toContain('Inter');
    expect(typography.labelSM.textTransform).toBe('uppercase');
  });

  it('exposes both elevation presets with shadow metadata', () => {
    expect(elevation.soft.shadowRadius).toBeGreaterThan(0);
    expect(elevation.prominent.shadowRadius).toBeGreaterThan(elevation.soft.shadowRadius);
    expect(elevation.prominent.elevation).toBeGreaterThan(elevation.soft.elevation);
  });
});
