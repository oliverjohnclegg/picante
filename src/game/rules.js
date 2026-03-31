import { LEVEL_MULTIPLIER, SPICY_QUESTIONS, SUIT_META, THRESHOLD_MATRIX } from "/src/game/constants.js";
import { pickRandom, pickRandomMany } from "/src/game/utils.js";

function getAbvBand(abvPercent) {
  if (abvPercent < 20) {
    return 0;
  }
  if (abvPercent < 30) {
    return 1;
  }
  if (abvPercent <= 40) {
    return 2;
  }
  return 3;
}

function getMatrixPlayerCount(playersCount) {
  return playersCount >= 8 ? 8 : Math.max(3, playersCount);
}

function rankToNumber(rank) {
  if (rank === "A" || rank === "J" || rank === "Q" || rank === "K" || rank === "Joker") {
    return 0;
  }
  return Number(rank);
}

export function computePlayerThreshold(playersCount, abvPercent, level) {
  const matrixPlayers = getMatrixPlayerCount(playersCount);
  const matrixRow = THRESHOLD_MATRIX[matrixPlayers];
  const band = getAbvBand(abvPercent);
  const base = matrixRow[band];
  const multiplier = LEVEL_MULTIPLIER[level] ?? 1;
  const adjusted = Math.max(3, Math.round(base * multiplier));
  return adjusted;
}

function getOtherPlayers(players, drawerId) {
  return players.filter((player) => player.id !== drawerId);
}

function getRandomOther(players, drawerId) {
  return pickRandom(getOtherPlayers(players, drawerId));
}

function getRandomTwoOthers(players, drawerId) {
  return pickRandomMany(getOtherPlayers(players, drawerId), 2);
}

function createForfeitBase(card) {
  return {
    title: `${SUIT_META[card.suit].label} · ${card.rank}`,
    text: "",
    suggestedPenalties: {},
    drinkEvents: [],
    holdingsGrantedTo: [],
    flags: { halvedThresholdsUntilAce: false },
    hostNotes: [],
    randomFlavor: "",
    requiresPenaltyAllocation: true,
  };
}

function buildHeartsForfeit(card, drawer, players) {
  const details = createForfeitBase(card);
  const number = rankToNumber(card.rank);
  const clockwise = getRandomOther(players, drawer.id);
  if (number >= 2) {
    details.text = `${clockwise?.name ?? "Another player"} asks ${drawer.name} a truth question (not yes/no). If ${drawer.name} answers, the asker takes ${number}. If not, ${drawer.name} takes ${number}.`;
    details.suggestedPenalties = { [clockwise?.id ?? drawer.id]: number };
    return details;
  }
  if (card.rank === "K") {
    details.text = `${clockwise?.name ?? "A player"} asks a deadly truth challenge. Resolve as numbered Hearts, with 15 penalties.`;
    details.suggestedPenalties = { [clockwise?.id ?? drawer.id]: 15 };
    return details;
  }
  if (card.rank === "Q") {
    details.text = `${drawer.name} reveals a spicy secret. If new to everyone, distribute 10. If not, ${drawer.name} takes 10.`;
    details.suggestedPenalties = { [drawer.id]: 10 };
    return details;
  }
  if (card.rank === "J") {
    details.text = `${drawer.name} states true/false about themselves. Everyone who guesses wrong takes distributed penalties totaling 10.`;
    details.suggestedPenalties = { [drawer.id]: 0 };
    details.hostNotes.push("Assign penalties to wrong guessers; if all guessed right, put all 10 on drawer.");
    return details;
  }
  details.text = `${drawer.name} holds a Volteo-style Heart Ace. If used, it flips incoming penalties to someone else and costs ${drawer.name} 5 penalties.`;
  details.holdingsGrantedTo = [drawer.id];
  details.hostNotes.push("Track this held card manually from scoreboard badges.");
  return details;
}

function buildDiamondsForfeit(card, drawer, players) {
  const details = createForfeitBase(card);
  const number = rankToNumber(card.rank);
  const counterClockwise = getRandomOther(players, drawer.id);
  if (number >= 2) {
    details.text = `${counterClockwise?.name ?? "Another player"} gives ${drawer.name} a dare. Success means asker takes ${number}; failure means ${drawer.name} takes ${number}.`;
    details.suggestedPenalties = { [counterClockwise?.id ?? drawer.id]: number };
    return details;
  }
  if (card.rank === "K") {
    details.text = `Deadly dare variant: resolve as numbered Diamonds but with 15 penalties.`;
    details.suggestedPenalties = { [counterClockwise?.id ?? drawer.id]: 15 };
    return details;
  }
  if (card.rank === "Q") {
    const target = getRandomOther(players, drawer.id);
    details.text = `${drawer.name} may send a risqué picture to ${target?.name ?? "a player"}. If they refuse, ${drawer.name} takes 10. If they do it, ${target?.name ?? "target"} takes 10.`;
    details.suggestedPenalties = { [drawer.id]: 10 };
    return details;
  }
  if (card.rank === "J") {
    const pair = getRandomTwoOthers(players, drawer.id);
    details.text = `${drawer.name} chooses two players for a shared dare (${pair.map((p) => p.name).join(" & ")}). If they fail, each takes 5. If they succeed, ${drawer.name} takes 10.`;
    if (pair.length === 2) {
      details.suggestedPenalties = { [pair[0].id]: 5, [pair[1].id]: 5 };
    } else {
      details.suggestedPenalties = { [drawer.id]: 10 };
    }
    return details;
  }
  details.text = `${drawer.name} holds Diamond Ace scout power. At any time, peek top 3 and force them as next draws (cost 5 when used).`;
  details.holdingsGrantedTo = [drawer.id];
  details.hostNotes.push("This app keeps draw fully random; use as social house-rule if desired.");
  return details;
}

function buildSpadesForfeit(card, drawer, players) {
  const details = createForfeitBase(card);
  const number = rankToNumber(card.rank);
  if (number >= 2) {
    const self = Math.ceil(number / 2);
    const rest = number - self;
    details.text = `${drawer.name} drinks ${self} penalties and distributes ${rest} among the group.`;
    details.suggestedPenalties = { [drawer.id]: self };
    return details;
  }
  if (card.rank === "K") {
    const target = getRandomOther(players, drawer.id);
    details.text = `${drawer.name} and ${target?.name ?? "another player"} each take 15 penalties.`;
    details.suggestedPenalties = target ? { [drawer.id]: 15, [target.id]: 15 } : { [drawer.id]: 15 };
    return details;
  }
  if (card.rank === "Q") {
    const target = getRandomOther(players, drawer.id);
    details.text = `${drawer.name} chooses ${target?.name ?? "someone"} for a kiss challenge. Resolve outcomes manually; total swing is 10 penalties.`;
    details.suggestedPenalties = { [drawer.id]: 5 };
    return details;
  }
  if (card.rank === "J") {
    const pair = getRandomTwoOthers(players, drawer.id);
    details.text = `${drawer.name} picks ${pair.map((p) => p.name).join(" & ")} for rock-paper-scissors. Loser takes 10 penalties.`;
    details.suggestedPenalties = pair.length ? { [pair[0].id]: 10 } : { [drawer.id]: 10 };
    return details;
  }
  details.text = `Global modifier: all penalty thresholds are halved until another Ace is played. Using the power costs ${drawer.name} 5 penalties.`;
  details.flags.halvedThresholdsUntilAce = true;
  details.hostNotes.push("App auto-applies threshold halving and clears on next Ace.");
  details.suggestedPenalties = { [drawer.id]: 5 };
  return details;
}

function buildClubsForfeit(card, drawer, players) {
  const details = createForfeitBase(card);
  const number = rankToNumber(card.rank);
  if (number >= 2) {
    const voted = getRandomOther(players, drawer.id) ?? drawer;
    const question = pickRandom(SPICY_QUESTIONS);
    details.text = `${drawer.name} asks: "${question}" Group votes. ${voted.name} gets penalties worth ${number} to distribute.`;
    details.suggestedPenalties = { [voted.id]: number };
    return details;
  }
  if (card.rank === "K") {
    const target = getRandomOther(players, drawer.id);
    details.text = `${target?.name ?? "A player"} faces ${drawer.name} in Bullshit. Loser takes 15 penalties.`;
    details.suggestedPenalties = { [drawer.id]: 15 };
    return details;
  }
  if (card.rank === "Q") {
    const target = getRandomOther(players, drawer.id);
    details.text = `${drawer.name} and ${target?.name ?? "opponent"} play a strip-style chicken challenge; first to back out takes 10.`;
    details.suggestedPenalties = { [drawer.id]: 10 };
    return details;
  }
  if (card.rank === "J") {
    const target = getRandomOther(players, drawer.id);
    details.text = `${drawer.name} picks ${target?.name ?? "a player"} and assigns any Queen forfeit to them.`;
    details.suggestedPenalties = { [target?.id ?? drawer.id]: 10 };
    return details;
  }
  details.text = `${drawer.name} holds Clubs Ace flip-position effect. If involved in a forfeit, swap role with someone else (cost 5, no penalty transfer).`;
  details.holdingsGrantedTo = [drawer.id];
  return details;
}

function buildJokerForfeit(drawer) {
  return {
    title: "Joker · Volteo",
    text: `${drawer.name} gains a Volteo. Use anytime to flip involvement on an eligible forfeit. Using it costs 5 penalties, then it returns to the deck.`,
    suggestedPenalties: {},
    drinkEvents: [],
    holdingsGrantedTo: [drawer.id],
    flags: { halvedThresholdsUntilAce: false },
    hostNotes: ["Any player may chain-counter Volteos by table agreement."],
    randomFlavor: "Chaos card online.",
    requiresPenaltyAllocation: true,
  };
}

export function createForfeit(card, drawer, players) {
  if (card.suit === "joker") {
    return buildJokerForfeit(drawer);
  }
  if (card.suit === "hearts") {
    return buildHeartsForfeit(card, drawer, players);
  }
  if (card.suit === "diamonds") {
    return buildDiamondsForfeit(card, drawer, players);
  }
  if (card.suit === "spades") {
    return buildSpadesForfeit(card, drawer, players);
  }
  return buildClubsForfeit(card, drawer, players);
}
