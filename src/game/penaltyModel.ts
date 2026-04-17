import type { Difficulty, Player } from '@game/types';

export const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  passive: 1.5,
  tradicional: 1.0,
  muerte: 0.5,
};

export const REFERENCE_PLAYER_COUNT = 5;
export const ABV_SCALAR = 32;

export function computeAbvBase(abv: number): number {
  const clampedAbv = Math.max(0, Math.min(1, abv));
  return Math.max(1, Math.round(ABV_SCALAR * clampedAbv));
}

export function computePlayerCountMultiplier(numPlayers: number): number {
  const safePlayers = Math.max(1, numPlayers);
  return REFERENCE_PLAYER_COUNT / safePlayers;
}

export function computeThreshold(abv: number, numPlayers: number, difficulty: Difficulty): number {
  const base = computeAbvBase(abv);
  const playerCountMultiplier = computePlayerCountMultiplier(numPlayers);
  const difficultyMultiplier = DIFFICULTY_MULTIPLIER[difficulty];
  return Math.max(1, Math.round(base * playerCountMultiplier * difficultyMultiplier));
}

export type ApplyPenaltiesResult = {
  player: Player;
  pendingShots: number;
};

export function applyPenalties(player: Player, penalties: number): ApplyPenaltiesResult {
  if (penalties <= 0) return { player, pendingShots: 0 };
  const rawPenalties = player.rawPenalties + penalties;
  const progressed = player.penaltiesSinceLastShot + penalties;
  const safeThreshold = Math.max(1, player.threshold);
  const pendingShots = Math.floor(progressed / safeThreshold);
  const penaltiesSinceLastShot = progressed % safeThreshold;
  return {
    player: {
      ...player,
      rawPenalties,
      penaltiesSinceLastShot,
      shotsTaken: player.shotsTaken + pendingShots,
    },
    pendingShots,
  };
}

export function recomputePlayerThresholds(players: Player[], numPlayers: number): Player[] {
  return players.map((p) => {
    if (p.status === 'removed') return p;
    const newThreshold = computeThreshold(p.abv, numPlayers, p.difficulty);
    return { ...p, threshold: newThreshold };
  });
}

export function shotProgressRatio(player: Player): number {
  const safeThreshold = Math.max(1, player.threshold);
  return Math.min(1, player.penaltiesSinceLastShot / safeThreshold);
}

export function rawPenaltyProgressRatio(rawPenalties: number, maxRawAmongActive: number): number {
  const denom = Math.max(1, maxRawAmongActive);
  return Math.min(1, Math.max(0, rawPenalties / denom));
}
