export const MIN_AGE = 18;

export type DobInput = {
  day: string;
  month: string;
  year: string;
};

export type DobValidation =
  | { valid: true; dobIso: string; age: number }
  | { valid: false; reason: 'invalid' | 'underage' };

export function parseDobParts(input: DobInput, now: Date = new Date()): DobValidation {
  const day = Number(input.day);
  const month = Number(input.month);
  const year = Number(input.year);

  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    return { valid: false, reason: 'invalid' };
  }
  if (day < 1 || day > 31 || month < 1 || month > 12) {
    return { valid: false, reason: 'invalid' };
  }
  if (year < 1900 || year > now.getUTCFullYear()) {
    return { valid: false, reason: 'invalid' };
  }

  const dob = new Date(Date.UTC(year, month - 1, day));
  if (
    dob.getUTCFullYear() !== year ||
    dob.getUTCMonth() !== month - 1 ||
    dob.getUTCDate() !== day
  ) {
    return { valid: false, reason: 'invalid' };
  }

  const age = computeAge(dob, now);
  if (age < MIN_AGE) {
    return { valid: false, reason: 'underage' };
  }

  const dobIso = `${pad4(year)}-${pad2(month)}-${pad2(day)}`;
  return { valid: true, dobIso, age };
}

export function computeAge(dob: Date, now: Date): number {
  let age = now.getUTCFullYear() - dob.getUTCFullYear();
  const beforeBirthday =
    now.getUTCMonth() < dob.getUTCMonth() ||
    (now.getUTCMonth() === dob.getUTCMonth() && now.getUTCDate() < dob.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function pad4(n: number): string {
  return String(n).padStart(4, '0');
}
