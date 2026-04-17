export type Suit = 'hearts' | 'diamonds' | 'spades' | 'clubs';

export type CardValue =
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 'J'
  | 'Q'
  | 'K'
  | 'A';

export type Card = {
  suit: Suit;
  value: CardValue;
  id: string;
};

export type Difficulty = 'passive' | 'tradicional' | 'muerte';

export type Gender = 'man' | 'woman' | 'nonbinary';

export type PlayerId = string;

export type Player = {
  id: PlayerId;
  name: string;
  abv: number;
  difficulty: Difficulty;
  gender: Gender;
  attractedTo: Gender[];
  rawPenalties: number;
  penaltiesSinceLastShot: number;
  shotsTaken: number;
  threshold: number;
  status: 'active' | 'removed';
};

export type TargetingMode = 'any' | 'physical';

export type MiniGameId =
  | 'index'
  | 'three-word'
  | 'categories'
  | 'thumb-war'
  | 'countdown'
  | 'rhyme-chain'
  | 'staring'
  | 'odds'
  | 'most-likely'
  | 'drawers-challenge'
  | 'rock-paper-scissors'
  | 'picante-roulette';

export type PenaltySpec = 'cardValue' | 'cardValueHalf' | number;

export type ForfeitTemplate = {
  suit: Suit;
  value: CardValue;
  text: string;
  penalty: PenaltySpec;
  targetingMode: TargetingMode;
  miniGame?: MiniGameId;
};

export type PackId = 'tradicional' | 'diablo';

export type Pack = {
  id: PackId;
  name: string;
  description: string;
  forfeits: ForfeitTemplate[];
};

export type GameMode = PackId;

export type TurnRecord = {
  turnIndex: number;
  drawerId: PlayerId;
  card: Card;
  penaltyAssignments: Record<PlayerId, number>;
  shotsTriggered: Record<PlayerId, number>;
};

export type ModalRequest =
  | { kind: 'shotTakeover'; playerId: PlayerId; shots: number }
  | { kind: 'distribute'; amount: number; excludedIds?: PlayerId[] }
  | { kind: 'vote' }
  | { kind: 'rosterEditor' }
  | { kind: 'none' };

export type GameState = {
  mode: GameMode;
  players: Player[];
  removedPlayers: Player[];
  currentPlayerIndex: number;
  deck: Card[];
  drawnCard: Card | null;
  history: TurnRecord[];
  pendingModal: ModalRequest | null;
  pendingShotQueue: Array<{ playerId: PlayerId; shots: number }>;
};
