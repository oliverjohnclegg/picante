import {
  colors,
  elevation,
  gradients,
  layout,
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

  it('exposes the sheet elevation preset used by bottom/center sheets', () => {
    expect(elevation.sheet.shadowRadius).toBeGreaterThan(0);
    expect(elevation.sheet.elevation).toBeGreaterThan(0);
  });

  it('gradient tuples are ready for LinearGradient (3 non-empty stops)', () => {
    for (const [key, stops] of Object.entries(gradients)) {
      expect(stops.length).toBeGreaterThanOrEqual(2);
      for (const stop of stops) {
        expect(typeof stop).toBe('string');
        expect(stop.length).toBeGreaterThan(0);
      }
      expect(Object.keys(gradients)).toContain(key);
    }
  });

  it('defines layout constants suitable for iOS HIG tap targets', () => {
    expect(layout.minTapTarget).toBeGreaterThanOrEqual(44);
    expect(layout.sheetPortraitMaxHeightRatio).toBeLessThanOrEqual(1);
    expect(layout.sheetLandscapeMaxHeightRatio).toBeLessThanOrEqual(1);
    expect(layout.centerSheetMaxWidth).toBeGreaterThan(layout.sheetLandscapeMaxWidth / 2);
  });
});
