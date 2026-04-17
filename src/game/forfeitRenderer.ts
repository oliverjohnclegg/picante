import type {
  CardValue,
  ForfeitTemplate,
  PenaltySpec,
  Player,
} from '@game/types';
import { cardPenaltyValue } from '@game/deck';

export type RenderTokens = {
  drawer: Player;
  cw: Player;
  ccw: Player;
  biasedRandom?: Player | null;
};

export function resolvePenalty(
  value: CardValue,
  penalty: PenaltySpec,
): number {
  if (typeof penalty === 'number') return penalty;
  const baseValue = cardPenaltyValue(value);
  if (penalty === 'cardValue') return baseValue;
  if (penalty === 'cardValueHalf') return Math.ceil(baseValue / 2);
  return baseValue;
}

export function neighbour(
  players: Player[],
  drawerIndex: number,
  direction: 'cw' | 'ccw',
): Player {
  const active = players.filter((p) => p.status === 'active');
  const drawer = players[drawerIndex]!;
  const activeIndex = active.findIndex((p) => p.id === drawer.id);
  const step = direction === 'cw' ? 1 : -1;
  const nextIndex = (activeIndex + step + active.length) % active.length;
  return active[nextIndex]!;
}

const TOKEN_REGEX = /\{\{(drawer|cw|ccw|biasedRandom)\}\}/g;

export function renderForfeitText(
  template: ForfeitTemplate,
  tokens: RenderTokens,
): string {
  return template.text.replace(TOKEN_REGEX, (_, key: keyof RenderTokens) => {
    const value = tokens[key];
    if (!value) return '???';
    return value.name;
  });
}
