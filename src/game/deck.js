import { RANKS, SUITS } from "/src/game/constants.js";
import { shuffle } from "/src/game/utils.js";

function createBaseDeck() {
  const cards = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({ suit, rank, id: `${rank}-${suit}` });
    }
  }
  cards.push({ suit: "joker", rank: "Joker", id: "joker-1" });
  cards.push({ suit: "joker", rank: "Joker", id: "joker-2" });
  return cards;
}

export function createShuffledDeck() {
  return shuffle(createBaseDeck());
}
