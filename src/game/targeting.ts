import type { Player, TargetingMode } from '@game/types';

export const ATTRACTION_WEIGHTS = {
  mutual: 3.0,
  oneSided: 1.0,
  neither: 0.3,
} as const;

export function lowPenWeight(candidate: Player, candidates: Player[]): number {
  const nonDrawer = candidates.filter((c) => c.id !== candidate.id);
  const maxRaw = nonDrawer.reduce((acc, c) => Math.max(acc, c.rawPenalties), 0);
  return maxRaw - candidate.rawPenalties + 1;
}

export function attractionWeight(drawer: Player, candidate: Player, mode: TargetingMode): number {
  if (mode === 'any') return 1.0;
  const drawerInto = drawer.attractedTo.includes(candidate.gender);
  const candidateInto = candidate.attractedTo.includes(drawer.gender);
  if (drawerInto && candidateInto) return ATTRACTION_WEIGHTS.mutual;
  if (drawerInto || candidateInto) return ATTRACTION_WEIGHTS.oneSided;
  return ATTRACTION_WEIGHTS.neither;
}

export function eligibleCandidates(drawer: Player, players: Player[]): Player[] {
  return players.filter((p) => p.id !== drawer.id && p.status === 'active');
}

export function computeWeights(
  drawer: Player,
  players: Player[],
  mode: TargetingMode,
): Array<{ player: Player; weight: number }> {
  const candidates = eligibleCandidates(drawer, players);
  return candidates.map((c) => ({
    player: c,
    weight: lowPenWeight(c, candidates) * attractionWeight(drawer, c, mode),
  }));
}

export function pickBiasedRandom(
  drawer: Player,
  players: Player[],
  mode: TargetingMode,
  rng: () => number = Math.random,
): Player | null {
  const weighted = computeWeights(drawer, players, mode);
  if (weighted.length === 0) return null;
  const totalWeight = weighted.reduce((acc, w) => acc + w.weight, 0);
  if (totalWeight <= 0) {
    const fallbackIdx = Math.floor(rng() * weighted.length);
    return weighted[fallbackIdx]?.player ?? null;
  }
  let roll = rng() * totalWeight;
  for (const entry of weighted) {
    roll -= entry.weight;
    if (roll <= 0) return entry.player;
  }
  return weighted[weighted.length - 1]?.player ?? null;
}
