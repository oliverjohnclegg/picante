import type { Difficulty, Gender, Player } from '@game/types';
import { computeThreshold } from '@game/penaltyModel';

export type PlayerDraft = {
  name: string;
  abv: number;
  difficulty: Difficulty;
  gender: Gender;
  attractedTo: Gender[];
};

let counter = 0;
function newPlayerId(): string {
  counter += 1;
  return `p_${Date.now().toString(36)}_${counter}`;
}

export function makePlayer(draft: PlayerDraft, numPlayers: number): Player {
  return {
    id: newPlayerId(),
    name: draft.name,
    abv: draft.abv,
    difficulty: draft.difficulty,
    gender: draft.gender,
    attractedTo: draft.attractedTo,
    rawPenalties: 0,
    penaltiesSinceLastShot: 0,
    shotsTaken: 0,
    threshold: computeThreshold(draft.abv, numPlayers, draft.difficulty),
    status: 'active',
  };
}
