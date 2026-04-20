import type { Player } from '@game/types';

export type AwardId = 'topDrinker' | 'ironLiver' | 'glassSlipper' | 'snowball';

export type Award = {
  id: AwardId;
  title: string;
  subtitle: string;
  player: Player;
};

type Candidate = Player;

export type AwardResolver = (players: Candidate[]) => Award | null;

function participants(players: Candidate[]): Candidate[] {
  return players.filter((p) => p.rawPenalties > 0 || p.shotsTaken > 0);
}

function pickOne<T>(items: T[], score: (item: T) => number): T | null {
  if (items.length === 0) return null;
  let best = items[0]!;
  let bestScore = score(best);
  for (let i = 1; i < items.length; i++) {
    const candidate = items[i]!;
    const s = score(candidate);
    if (s > bestScore) {
      best = candidate;
      bestScore = s;
    }
  }
  return bestScore > 0 ? best : null;
}

export const topDrinker: AwardResolver = (players) => {
  const field = participants(players).filter((p) => p.shotsTaken > 0);
  const winner = pickOne(field, (p) => p.shotsTaken);
  if (!winner) return null;
  return {
    id: 'topDrinker',
    title: 'Top Drinker',
    subtitle: `${winner.shotsTaken} shot${winner.shotsTaken === 1 ? '' : 's'}`,
    player: winner,
  };
};

export const ironLiver: AwardResolver = (players) => {
  const field = participants(players).filter((p) => p.shotsTaken === 0);
  const winner = pickOne(field, (p) => p.rawPenalties);
  if (!winner) return null;
  return {
    id: 'ironLiver',
    title: 'Iron Liver',
    subtitle: `${winner.rawPenalties} penalties · zero shots`,
    player: winner,
  };
};

export const glassSlipper: AwardResolver = (players) => {
  const field = participants(players);
  if (field.length === 0) return null;
  let winner = field[0]!;
  for (let i = 1; i < field.length; i++) {
    const p = field[i]!;
    if (p.rawPenalties < winner.rawPenalties) winner = p;
  }
  return {
    id: 'glassSlipper',
    title: 'Glass Slipper',
    subtitle: `only ${winner.rawPenalties} penalties all night`,
    player: winner,
  };
};

export const snowball: AwardResolver = (players) => {
  const field = participants(players).filter((p) => p.threshold > 0);
  const winner = pickOne(field, (p) => p.rawPenalties / p.threshold);
  if (!winner) return null;
  const ratio = winner.rawPenalties / winner.threshold;
  return {
    id: 'snowball',
    title: 'Snowball',
    subtitle: `${ratio.toFixed(1)}× their own threshold`,
    player: winner,
  };
};

export function computeAwards(players: Candidate[]): Award[] {
  const resolvers: AwardResolver[] = [topDrinker, ironLiver, glassSlipper, snowball];
  const awards: Award[] = [];
  const usedPlayerIds = new Set<string>();

  for (const resolve of resolvers) {
    const award = resolve(players);
    if (award && !usedPlayerIds.has(award.player.id)) {
      awards.push(award);
      usedPlayerIds.add(award.player.id);
    } else if (award) {
      awards.push(award);
    }
  }
  return awards;
}
