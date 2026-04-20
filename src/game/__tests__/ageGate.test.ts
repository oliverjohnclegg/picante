import { parseDobParts, computeAge, MIN_AGE } from '@game/ageGate';

describe('ageGate parseDobParts', () => {
  const now = new Date('2026-04-20T00:00:00Z');

  it('accepts a valid DOB of someone comfortably 18+', () => {
    const result = parseDobParts({ day: '15', month: '06', year: '1995' }, now);
    expect(result).toEqual({ valid: true, dobIso: '1995-06-15', age: 30 });
  });

  it('accepts exactly 18 years old today', () => {
    const result = parseDobParts({ day: '20', month: '04', year: '2008' }, now);
    expect(result).toEqual({ valid: true, dobIso: '2008-04-20', age: 18 });
  });

  it('rejects 18th birthday tomorrow as underage', () => {
    const result = parseDobParts({ day: '21', month: '04', year: '2008' }, now);
    expect(result).toEqual({ valid: false, reason: 'underage' });
  });

  it('rejects dob leaf data older than 1900', () => {
    expect(parseDobParts({ day: '1', month: '1', year: '1800' }, now)).toEqual({
      valid: false,
      reason: 'invalid',
    });
  });

  it('rejects future years', () => {
    expect(parseDobParts({ day: '1', month: '1', year: '2099' }, now)).toEqual({
      valid: false,
      reason: 'invalid',
    });
  });

  it('rejects invalid month / day combinations (e.g. Feb 30)', () => {
    expect(parseDobParts({ day: '30', month: '2', year: '1990' }, now)).toEqual({
      valid: false,
      reason: 'invalid',
    });
  });

  it('rejects non-numeric input', () => {
    expect(parseDobParts({ day: 'ab', month: '04', year: '1990' }, now)).toEqual({
      valid: false,
      reason: 'invalid',
    });
  });

  it('pads single-digit day and month with leading zeros in the ISO string', () => {
    expect(parseDobParts({ day: '3', month: '7', year: '1999' }, now)).toEqual({
      valid: true,
      dobIso: '1999-07-03',
      age: 26,
    });
  });

  it('MIN_AGE is 18', () => {
    expect(MIN_AGE).toBe(18);
  });

  it('computeAge handles pre-birthday edge case for current year', () => {
    const fixedNow = new Date('2026-04-20T00:00:00Z');
    const bornAfter = new Date('2000-08-01T00:00:00Z');
    expect(computeAge(bornAfter, fixedNow)).toBe(25);
  });
});
