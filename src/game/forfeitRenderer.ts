import type { CardValue, ForfeitTemplate, PenaltySpec, Player } from '@game/types';
import { cardPenaltyValue } from '@game/deck';

export type RenderTokens = {
  drawer: Player;
  biasedRandom?: Player | null;
};

export function resolvePenalty(value: CardValue, penalty: PenaltySpec): number {
  if (typeof penalty === 'number') return penalty;
  const baseValue = cardPenaltyValue(value);
  if (penalty === 'cardValue') return baseValue;
  if (penalty === 'cardValueHalf') return Math.ceil(baseValue / 2);
  return baseValue;
}

const TOKEN_REGEX = /\{\{(drawer|biasedRandom)\}\}/g;

export function renderForfeitText(template: ForfeitTemplate, tokens: RenderTokens): string {
  return template.text.replace(TOKEN_REGEX, (_, key: keyof RenderTokens) => {
    const value = tokens[key];
    if (!value) return '???';
    return value.name;
  });
}
