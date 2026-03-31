export const LEVEL_OPTIONS = ["light", "medium", "muerte"];

export const LEVEL_MULTIPLIER = {
  light: 1.15,
  medium: 1,
  muerte: 0.85,
};

export const THRESHOLD_MATRIX = {
  3: [10, 16, 22, 29],
  4: [8, 13, 18, 23],
  5: [6, 10, 14, 18],
  6: [5, 8, 11, 14],
  7: [4, 7, 10, 13],
  8: [4, 6, 8, 11],
};

export const SUITS = ["hearts", "diamonds", "spades", "clubs"];
export const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

export const SUIT_META = {
  hearts: { label: "Hearts · Secretos", symbol: "♥", color: "hearts" },
  diamonds: { label: "Diamonds · Riesgos", symbol: "♦", color: "diamonds" },
  spades: { label: "Spades · Sorbo", symbol: "♠", color: "spades" },
  clubs: { label: "Clubs · Locura", symbol: "♣", color: "clubs" },
  joker: { label: "Joker · Volteo", symbol: "🃏", color: "joker" },
};

export const SPICY_QUESTIONS = [
  "Who is most likely to accidentally reveal a huge secret tonight?",
  "Who is most likely to send a risky text after midnight?",
  "Who is most likely to survive a zombie apocalypse with pure chaos energy?",
  "Who is most likely to flirt their way out of trouble?",
  "Who is most likely to win this game without mercy?",
  "Who is most likely to start a scandal and deny it instantly?",
  "Who is most likely to become the unofficial therapist of the group?",
  "Who is most likely to become the villain arc of the night?",
];

export const HOLDABLE_RANKS = new Set(["A"]);
