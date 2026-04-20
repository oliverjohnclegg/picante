import {
  ABV_MAX_PCT,
  ABV_MIN_PCT,
  buildPlayerDraft,
  clampAbvPercent,
  type PlayerDraftInput,
} from '@ui/components/playerForm/playerDraftInput';

describe('buildPlayerDraft', () => {
  const base: PlayerDraftInput = {
    name: 'Clegg',
    abvStr: '12',
    difficulty: 'tradicional',
    gender: 'man',
    attractedTo: [],
  };

  it('returns null when name is blank after trimming', () => {
    expect(buildPlayerDraft({ ...base, name: '   ' })).toBeNull();
  });

  it('trims whitespace from names', () => {
    const draft = buildPlayerDraft({ ...base, name: '  Harley  ' });
    expect(draft?.name).toBe('Harley');
  });

  it('converts percentage ABV string into a 0–1 ratio', () => {
    const draft = buildPlayerDraft({ ...base, abvStr: '40' });
    expect(draft?.abv).toBeCloseTo(0.4, 5);
  });

  it('clamps out-of-range ABV and NaN inputs', () => {
    expect(buildPlayerDraft({ ...base, abvStr: '-99' })?.abv).toBe(0);
    expect(buildPlayerDraft({ ...base, abvStr: '9999' })?.abv).toBe(1);
    expect(buildPlayerDraft({ ...base, abvStr: 'nope' })?.abv).toBe(0);
  });

  it('preserves attractedTo selections', () => {
    const draft = buildPlayerDraft({
      ...base,
      attractedTo: ['man', 'nonbinary'],
    });
    expect(draft?.attractedTo).toEqual(['man', 'nonbinary']);
  });
});

describe('clampAbvPercent', () => {
  it('uses 0 for unparseable values', () => {
    expect(clampAbvPercent('not-a-number')).toBe(0);
  });

  it('respects bounds', () => {
    expect(clampAbvPercent(String(ABV_MIN_PCT - 10))).toBe(ABV_MIN_PCT);
    expect(clampAbvPercent(String(ABV_MAX_PCT + 10))).toBe(ABV_MAX_PCT);
  });

  it('passes through in-range values', () => {
    expect(clampAbvPercent('37.5')).toBeCloseTo(37.5, 5);
  });
});
