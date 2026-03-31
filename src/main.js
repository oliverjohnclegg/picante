import { LEVEL_OPTIONS, SUIT_META } from "/src/game/constants.js";
import {
  createGame,
  drawTurn,
  endTurn,
  getActivePlayer,
  getDisplayThreshold,
  randomizeTurnPenalties,
  resetTurnPenalties,
  setTurnPenalty,
} from "/src/game/engine.js";

const elements = {
  setupScreen: document.querySelector("#setup-screen"),
  gameScreen: document.querySelector("#game-screen"),
  playerCount: document.querySelector("#player-count"),
  startGame: document.querySelector("#start-game"),
  playersConfig: document.querySelector("#players-config"),
  newGame: document.querySelector("#new-game"),
  deckMeta: document.querySelector("#deck-meta"),
  turnMeta: document.querySelector("#turn-meta"),
  drawCard: document.querySelector("#draw-card"),
  cardView: document.querySelector("#card-view"),
  forfeitView: document.querySelector("#forfeit-view"),
  penaltyControls: document.querySelector("#penalty-controls"),
  randomizePenalties: document.querySelector("#randomize-penalties"),
  resetPenalties: document.querySelector("#reset-penalties"),
  endTurn: document.querySelector("#end-turn"),
  scoreboard: document.querySelector("#scoreboard"),
};

let gameState = null;
let lastDrinkAlerts = [];

function setScreen(screen) {
  elements.setupScreen.classList.toggle("hidden", screen !== "setup");
  elements.gameScreen.classList.toggle("hidden", screen !== "game");
}

function createLevelOptions(selected) {
  return LEVEL_OPTIONS.map((level) => {
    const picked = level === selected ? "selected" : "";
    return `<option value="${level}" ${picked}>${level}</option>`;
  }).join("");
}

function createPlayerConfigRow(index) {
  return `
    <article class="player-config-row" data-row-index="${index}">
      <input type="text" class="player-name" placeholder="Player ${index + 1}" maxlength="18" />
      <input type="number" class="player-abv" min="0" max="95" step="1" placeholder="ABV %" />
      <select class="player-level">${createLevelOptions("medium")}</select>
    </article>
  `;
}

function renderPlayerConfigRows() {
  const count = Number(elements.playerCount.value);
  elements.playersConfig.innerHTML = Array.from({ length: count }, (_, index) => createPlayerConfigRow(index)).join("");
}

function parsePlayersFromSetup() {
  const rows = [...elements.playersConfig.querySelectorAll(".player-config-row")];
  return rows.map((row, index) => {
    const nameInput = row.querySelector(".player-name");
    const abvInput = row.querySelector(".player-abv");
    const levelInput = row.querySelector(".player-level");
    const name = (nameInput?.value || "").trim() || `Player ${index + 1}`;
    const abv = Math.max(0, Math.min(95, Number(abvInput?.value || 5)));
    const level = levelInput?.value || "medium";
    return { name, abv, level };
  });
}

function playerById(id) {
  if (!gameState) return null;
  return gameState.players.find((player) => player.id === id) ?? null;
}

function renderDeckAndTurnMeta() {
  if (!gameState) return;
  const activePlayer = getActivePlayer(gameState);
  const modifierText = gameState.halvedThresholdsActive ? " · Halved" : "";
  elements.deckMeta.textContent = `Deck ${gameState.deck.length} · Discard ${gameState.discard.length}${modifierText}`;
  elements.turnMeta.textContent = `${activePlayer.name}'s Turn`;
}

function renderScoreboard() {
  if (!gameState) return;
  const activeId = getActivePlayer(gameState).id;
  elements.scoreboard.innerHTML = gameState.players
    .map((player) => {
      const threshold = getDisplayThreshold(player, gameState);
      const isActive = player.id === activeId;
      return `
        <article class="player-card ${isActive ? "is-active" : ""}">
          <div class="player-card-header">
            <span class="player-card-name">${player.name}</span>
            <span class="level">${player.level}</span>
          </div>
          <div class="player-card-stats">
            <span>Pen ${player.pendingPenalties}/${threshold}</span>
            <span>Drinks ${player.drinksTaken}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function cardMarkup(card) {
  const meta = SUIT_META[card.suit];
  return `
    <article class="card-face ${meta.color}">
      <span class="rank">${card.rank}</span>
      <span class="symbol">${meta.symbol}</span>
    </article>
  `;
}

function renderForfeit(turn) {
  elements.forfeitView.innerHTML = `
    <p class="forfeit-text">${turn.forfeit.text}</p>
  `;
}

function renderPenaltyControls() {
  if (!gameState) return;
  const turn = gameState.currentTurn;
  if (!turn) {
    elements.penaltyControls.innerHTML = `<p class="muted compact">Draw a card to begin.</p>`;
    return;
  }
  const total = Object.values(turn.allocations).reduce((sum, value) => sum + value, 0);
  elements.penaltyControls.innerHTML = `
    <p class="penalty-header">${total} / ${turn.suggestedTotal} allocated</p>
    <div class="allocation-grid">
      ${gameState.players
        .map((player) => {
          const value = turn.allocations[player.id] ?? 0;
          return `
            <label class="allocation-row">
              <span>${player.name}</span>
              <input type="number" min="0" max="300" data-player-id="${player.id}" value="${value}" />
            </label>
          `;
        })
        .join("")}
    </div>
  `;
  [...elements.penaltyControls.querySelectorAll("input[data-player-id]")].forEach((input) => {
    input.addEventListener("input", (event) => {
      const playerId = event.target.getAttribute("data-player-id");
      setTurnPenalty(gameState, playerId, event.target.value);
      renderPenaltyControls();
    });
  });
}

function renderCurrentTurnArea() {
  if (!gameState) return;
  if (!gameState.currentTurn) {
    elements.cardView.innerHTML = "";
    elements.forfeitView.innerHTML = "";
  } else {
    elements.cardView.innerHTML = cardMarkup(gameState.currentTurn.card);
    renderForfeit(gameState.currentTurn);
  }
  renderPenaltyControls();
  const hasTurn = Boolean(gameState.currentTurn);
  elements.drawCard.disabled = hasTurn;
  elements.endTurn.disabled = !hasTurn;
  elements.randomizePenalties.disabled = !hasTurn;
  elements.resetPenalties.disabled = !hasTurn;
}

function renderAlerts() {
  if (!gameState || !lastDrinkAlerts.length) return;
  const text = lastDrinkAlerts
    .map((alert) => `${alert.name} drinks ${alert.drinksDue}`)
    .join(" · ");
  elements.forfeitView.insertAdjacentHTML("afterbegin", `<p class="alert">${text}</p>`);
}

function renderAll() {
  renderDeckAndTurnMeta();
  renderScoreboard();
  renderCurrentTurnArea();
  renderAlerts();
}

function announce(message) {
  if (!gameState) return;
  gameState.log.unshift({ type: "system", message });
}

function startGame() {
  const players = parsePlayersFromSetup();
  if (players.length < 3) return;
  gameState = createGame(players);
  lastDrinkAlerts = [];
  setScreen("game");
  renderAll();
}

function handleDrawCard() {
  if (!gameState) return;
  const result = drawTurn(gameState);
  if (!result.ok) {
    announce(result.message);
  } else {
    const drawer = playerById(result.turn.drawerId);
    const card = result.turn.card;
    const meta = SUIT_META[card.suit];
    announce(`${drawer?.name ?? "Player"} drew ${card.rank} ${meta.symbol}`);
  }
  renderAll();
}

function handleEndTurn() {
  if (!gameState) return;
  const result = endTurn(gameState);
  if (!result.ok) {
    announce(result.message);
    renderAll();
    return;
  }
  lastDrinkAlerts = result.alerts;
  renderAll();
}

function initPlayerCount() {
  elements.playerCount.innerHTML = Array.from({ length: 8 }, (_, index) => {
    const value = index + 3;
    const selected = value === 4 ? "selected" : "";
    return `<option value="${value}" ${selected}>${value}</option>`;
  }).join("");
}

function initEvents() {
  elements.playerCount.addEventListener("change", renderPlayerConfigRows);
  elements.startGame.addEventListener("click", startGame);
  elements.newGame.addEventListener("click", () => {
    gameState = null;
    lastDrinkAlerts = [];
    setScreen("setup");
  });
  elements.drawCard.addEventListener("click", handleDrawCard);
  elements.endTurn.addEventListener("click", handleEndTurn);
  elements.randomizePenalties.addEventListener("click", () => {
    if (!gameState) return;
    randomizeTurnPenalties(gameState);
    renderAll();
  });
  elements.resetPenalties.addEventListener("click", () => {
    if (!gameState) return;
    resetTurnPenalties(gameState);
    renderAll();
  });
}

function init() {
  initPlayerCount();
  renderPlayerConfigRows();
  initEvents();
  setScreen("setup");
}

init();
