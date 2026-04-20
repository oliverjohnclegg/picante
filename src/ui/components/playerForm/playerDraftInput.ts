import type { PlayerDraft } from '@game/playerFactory';
import type { Difficulty, Gender } from '@game/types';

export const DEFAULT_ABV_STR = '12';
export const ABV_MIN_PCT = 0;
export const ABV_MAX_PCT = 100;

export type PlayerDraftInput = {
  name: string;
  abvStr: string;
  difficulty: Difficulty;
  gender: Gender;
  attractedTo: Gender[];
};

export function buildPlayerDraft(input: PlayerDraftInput): PlayerDraft | null {
  const trimmed = input.name.trim();
  if (!trimmed) return null;
  const abv = clampAbvPercent(input.abvStr) / 100;
  return {
    name: trimmed,
    abv,
    difficulty: input.difficulty,
    gender: input.gender,
    attractedTo: input.attractedTo,
  };
}

export function clampAbvPercent(raw: string): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(ABV_MIN_PCT, Math.min(ABV_MAX_PCT, parsed));
}
