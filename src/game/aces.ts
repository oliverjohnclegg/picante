import type { Player, PlayerId, Suit } from '@game/types';

export const DRAWER_ACE_SURCHARGE = 5;

export type AceAssignment = {
  playerId: PlayerId;
  penalties: number;
  reason: string;
};

function sortedByRawPenalties(players: Player[], ascending: boolean): Player[] {
  return [...players].sort((a, b) => {
    const delta = a.rawPenalties - b.rawPenalties;
    return ascending ? delta : -delta;
  });
}

function topThreeAssignments(ordered: Player[], label: (rank: number) => string): AceAssignment[] {
  const amounts = [15, 10, 5];
  return ordered.slice(0, 3).map((p, idx) => ({
    playerId: p.id,
    penalties: amounts[idx]!,
    reason: label(idx + 1),
  }));
}

function singleAssignmentForSwing(
  players: Player[],
  pickLowest: boolean,
  reason: string,
): AceAssignment | null {
  if (players.length < 2) return null;
  const lowest = sortedByRawPenalties(players, true)[0]!;
  const highest = sortedByRawPenalties(players, false)[0]!;
  const penalty = Math.floor((highest.rawPenalties - lowest.rawPenalties) / 2);
  if (penalty <= 0) return null;
  const target = pickLowest ? lowest : highest;
  return { playerId: target.id, penalties: penalty, reason };
}

export function resolveAce(suit: Suit, drawer: Player, players: Player[]): AceAssignment[] {
  const active = players.filter((p) => p.status === 'active');
  const assignments: AceAssignment[] = [];

  if (suit === 'spades') {
    const lowest = sortedByRawPenalties(active, true);
    assignments.push(...topThreeAssignments(lowest, (rank) => `sober-rank-${rank}`));
  } else if (suit === 'hearts') {
    const highest = sortedByRawPenalties(active, false);
    assignments.push(...topThreeAssignments(highest, (rank) => `loud-rank-${rank}`));
  } else if (suit === 'diamonds') {
    const swing = singleAssignmentForSwing(active, true, 'risk-equaliser');
    if (swing) assignments.push(swing);
  } else if (suit === 'clubs') {
    const swing = singleAssignmentForSwing(active, false, 'chaos-snowball');
    if (swing) assignments.push(swing);
  }

  const drawerEntry = assignments.find((a) => a.playerId === drawer.id);
  if (drawerEntry) {
    drawerEntry.penalties += DRAWER_ACE_SURCHARGE;
    drawerEntry.reason = `${drawerEntry.reason}+drawer-surcharge`;
  } else {
    assignments.push({
      playerId: drawer.id,
      penalties: DRAWER_ACE_SURCHARGE,
      reason: 'drawer-surcharge',
    });
  }

  return assignments;
}
