import { SUIT_META } from "/src/game/constants.js";
import { createShuffledDeck } from "/src/game/deck.js";
import { createForfeit, computePlayerThreshold } from "/src/game/rules.js";
import { clamp, distributeRandomly, shuffle } from "/src/game/utils.js";

function numericCardValue(rank) {
  if (rank === "A" || rank === "J" || rank === "Q" || rank === "K" || rank === "Joker") {
    return 0;
  }
  return Number(rank);
}

function faceCardDefaultPenalty(rank) {
  if (rank === "K") {
    return 15;
  }
  if (rank === "Q" || rank === "J" || rank === "A") {
    return 10;
  }
  return 0;
}

function getSuggestedTotal(card, forfeit) {
  const suggestedTotal = Object.values(forfeit.suggestedPenalties).reduce((sum, value) => sum + value, 0);
  if (suggestedTotal > 0) {
    return suggestedTotal;
  }
  const numeric = numericCardValue(card.rank);
  if (numeric > 0) {
    return numeric;
  }
  return faceCardDefaultPenalty(card.rank);
}

function toHoldingLabel(card) {
  if (card.suit === "joker") {
    return "Volteo";
  }
  const suitSymbol = SUIT_META[card.suit].symbol;
  return `${card.rank}${suitSymbol}`;
}

function addHolding(player, label) {
  if (!player.holdings.includes(label)) {
    player.holdings.push(label);
  }
}

function getEffectiveThreshold(player, halvedThresholdsActive) {
  if (!halvedThresholdsActive) {
    return player.threshold;
  }
  return Math.max(2, Math.ceil(player.threshold / 2));
}

function getPlayerById(state, playerId) {
  return state.players.find((player) => player.id === playerId);
}

function ensureDeck(state) {
  if (state.deck.length > 0) {
    return;
  }
  if (state.discard.length === 0) {
    return;
  }
  state.deck = shuffle(state.discard);
  state.discard = [];
  state.log.unshift({
    type: "deck",
    message: "Deck exhausted. Discard reshuffled into a fresh deck.",
  });
}

function getInitialAllocations(players, suggestedPenalties) {
  return Object.fromEntries(players.map((player) => [player.id, suggestedPenalties[player.id] ?? 0]));
}

export function createGame(playerConfigs) {
  const playersCount = playerConfigs.length;
  const players = playerConfigs.map((config, index) => ({
    id: `p-${index + 1}`,
    name: config.name.trim() || `Player ${index + 1}`,
    abv: Number(config.abv),
    level: config.level,
    threshold: computePlayerThreshold(playersCount, Number(config.abv), config.level),
    totalPenalties: 0,
    pendingPenalties: 0,
    drinksTaken: 0,
    holdings: [],
  }));

  return {
    players,
    deck: createShuffledDeck(),
    discard: [],
    turnIndex: 0,
    turnNumber: 1,
    currentTurn: null,
    halvedThresholdsActive: false,
    log: [
      {
        type: "start",
        message: `Game started with ${players.length} players.`,
      },
    ],
  };
}

export function getActivePlayer(state) {
  return state.players[state.turnIndex];
}

export function drawTurn(state) {
  if (state.currentTurn) {
    return { ok: false, message: "Finish this turn before drawing another card." };
  }

  ensureDeck(state);
  if (state.deck.length === 0) {
    return { ok: false, message: "Deck is empty." };
  }

  const drawer = getActivePlayer(state);
  const card = state.deck.pop();
  const forfeit = createForfeit(card, drawer, state.players);
  const allocations = getInitialAllocations(state.players, forfeit.suggestedPenalties);
  const suggestedTotal = getSuggestedTotal(card, forfeit);

  state.currentTurn = {
    drawerId: drawer.id,
    card,
    forfeit,
    allocations,
    baseAllocations: { ...allocations },
    suggestedTotal,
  };

  return { ok: true, turn: state.currentTurn };
}

export function setTurnPenalty(state, playerId, value) {
  if (!state.currentTurn) {
    return;
  }
  state.currentTurn.allocations[playerId] = clamp(Number(value) || 0, 0, 300);
}

export function resetTurnPenalties(state) {
  if (!state.currentTurn) {
    return;
  }
  state.currentTurn.allocations = { ...state.currentTurn.baseAllocations };
}

export function randomizeTurnPenalties(state) {
  if (!state.currentTurn) {
    return;
  }
  const playerIds = state.players.map((player) => player.id);
  state.currentTurn.allocations = distributeRandomly(playerIds, state.currentTurn.suggestedTotal);
}

export function getDisplayThreshold(player, state) {
  return getEffectiveThreshold(player, state.halvedThresholdsActive);
}

export function endTurn(state) {
  if (!state.currentTurn) {
    return { ok: false, message: "Draw a card before ending the turn.", alerts: [] };
  }

  const { card, forfeit, allocations, drawerId } = state.currentTurn;
  const drawer = getPlayerById(state, drawerId);
  const allocationLines = [];

  for (const player of state.players) {
    const points = allocations[player.id] ?? 0;
    if (points <= 0) {
      continue;
    }
    player.totalPenalties += points;
    player.pendingPenalties += points;
    allocationLines.push(`${player.name} +${points}`);
  }

  if (allocationLines.length > 0) {
    state.log.unshift({
      type: "penalties",
      message: `${drawer.name} resolved ${card.rank} ${SUIT_META[card.suit].symbol}: ${allocationLines.join(", ")}`,
    });
  } else {
    state.log.unshift({
      type: "penalties",
      message: `${drawer.name} resolved ${card.rank} ${SUIT_META[card.suit].symbol} with no penalties assigned.`,
    });
  }

  if (card.rank === "A" && state.halvedThresholdsActive) {
    state.halvedThresholdsActive = false;
    state.log.unshift({
      type: "modifier",
      message: "Ace played. Global halved-threshold modifier ended.",
    });
  }

  if (forfeit.flags.halvedThresholdsUntilAce) {
    state.halvedThresholdsActive = true;
    state.log.unshift({
      type: "modifier",
      message: "Spades Ace effect activated. Thresholds are now halved until another Ace appears.",
    });
  }

  if (forfeit.holdingsGrantedTo.length > 0) {
    const label = toHoldingLabel(card);
    for (const holderId of forfeit.holdingsGrantedTo) {
      const holder = getPlayerById(state, holderId);
      if (!holder) {
        continue;
      }
      addHolding(holder, label);
      state.log.unshift({
        type: "holding",
        message: `${holder.name} gained held card: ${label}`,
      });
    }
  }

  const alerts = [];
  for (const player of state.players) {
    const threshold = getEffectiveThreshold(player, state.halvedThresholdsActive);
    if (threshold <= 0 || player.pendingPenalties < threshold) {
      continue;
    }
    const drinksDue = Math.floor(player.pendingPenalties / threshold);
    player.pendingPenalties -= drinksDue * threshold;
    player.drinksTaken += drinksDue;
    alerts.push({
      playerId: player.id,
      name: player.name,
      drinksDue,
      threshold,
      remainingPenaltyBuffer: player.pendingPenalties,
    });
    state.log.unshift({
      type: "drink",
      message: `${player.name} crossed threshold ${threshold} and must drink ${drinksDue}.`,
    });
  }

  if (alerts.length === 0) {
    state.log.unshift({
      type: "drink",
      message: "No one crossed their threshold this turn.",
    });
  }

  state.discard.push(card);
  state.currentTurn = null;
  state.turnIndex = (state.turnIndex + 1) % state.players.length;
  state.turnNumber += 1;

  return { ok: true, alerts };
}
