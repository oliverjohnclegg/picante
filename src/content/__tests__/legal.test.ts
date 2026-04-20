import { TOS_SECTIONS, PRIVACY_SECTIONS } from '@content/legal';

describe('legal content', () => {
  it('ships a non-empty ToS', () => {
    expect(TOS_SECTIONS.length).toBeGreaterThan(3);
    for (const section of TOS_SECTIONS) {
      expect(section.heading.length).toBeGreaterThan(0);
      expect(section.body.length).toBeGreaterThan(40);
    }
  });

  it('ships a non-empty privacy policy', () => {
    expect(PRIVACY_SECTIONS.length).toBeGreaterThan(3);
    for (const section of PRIVACY_SECTIONS) {
      expect(section.heading.length).toBeGreaterThan(0);
      expect(section.body.length).toBeGreaterThan(40);
    }
  });

  it('ToS explicitly surfaces the 18+ requirement', () => {
    const combined = TOS_SECTIONS.map((s) => s.body).join(' ');
    expect(combined).toMatch(/18/);
    expect(combined).toMatch(/cop-?out/i);
  });

  it('privacy policy explicitly states no PII is collected', () => {
    const combined = PRIVACY_SECTIONS.map((s) => s.body).join(' ');
    expect(combined).toMatch(/no (personal|accounts?|analytics)/i);
  });
});
