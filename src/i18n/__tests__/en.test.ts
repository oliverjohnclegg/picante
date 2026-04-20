import { strings } from '@i18n/en';

describe('en strings catalog', () => {
  it('exports app identity copy', () => {
    expect(strings.app.name).toBe('Picante');
    expect(strings.app.tagline.length).toBeGreaterThan(0);
  });

  it('builds dynamic shot takeover label', () => {
    expect(strings.shotTakeover.takeNShots(1)).toBe('TAKE 1 SHOT');
    expect(strings.shotTakeover.takeNShots(3)).toBe('TAKE 3 SHOTS');
  });

  it('builds dynamic split hint text', () => {
    const hint = strings.choose.splitHint('Alex', 6);
    expect(hint).toContain('Alex automatically takes 6');
    expect(hint).toContain('Pick who takes the remainder');
  });

  it('contains the key app-store compliance disclaimers', () => {
    expect(strings.legal.ageGateTitle).toMatch(/18 or older/i);
    expect(strings.legal.disclaimerBody).toMatch(/Know your limits/i);
  });
});
