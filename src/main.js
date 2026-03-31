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
  addPlayerScreen: document.querySelector("#add-player-screen"),
  confirmScreen: document.querySelector("#confirm-screen"),
  gameScreen: document.querySelector("#game-screen"),
  playerCount: document.querySelector("#player-count"),
  generatePlayers: document.querySelector("#generate-players"),
  confirmPlayers: document.querySelector("#confirm-players"),
  playersConfig: document.querySelector("#players-config"),
  playersConfirmation: document.querySelector("#players-confirmation"),
  editPlayers: document.querySelector("#edit-players"),
  startGame: document.querySelector("#start-game"),
  newGame: document.querySelector("#new-game"),
  deckMeta: document.querySelector("#deck-meta"),
  turnMeta: document.querySelector("#turn-meta"),
  turnTitle: document.querySelector("#turn-title"),
  drawCard: document.querySelector("#draw-card"),
  cardView: document.querySelector("#card-view"),
  forfeitView: document.querySelector("#forfeit-view"),
  penaltyControls: document.querySelector("#penalty-controls"),
  randomizePenalties: document.querySelector("#randomize-penalties"),
  resetPenalties: document.querySelector("#reset-penalties"),
  endTurn: document.querySelector("#end-turn"),
  scoreboard: document.querySelector("#scoreboard"),
  eventLog: document.querySelector("#event-log"),
};

let gameState = null;
let lastDrinkAlerts = [];
let pendingPlayers = [];

function setScreen(screen) {
  elements.addPlayerScreen.classList.toggle("hidden", screen !== "add-players");
  elements.confirmScreen.classList.toggle("hidden", screen !== "confirm");
  elements.gameScreen.classList.toggle("hidden", screen !== "game");
}

function createLevelOptions(selected) {
  return LEVEL_OPTIONS.map((level) => {
    const picked = level === selected ? "selected" : "";
    return `<option value="${level}" ${picked}>${level}</option>`;
  }).join("");
}

function createPlayerConfigRow(index) {
  const defaultAbv = index % 3 === 0 ? 5 : index % 3 === 1 ? 25 : 40;
  return `
    <article class="player-config-row" data-row-index="${index}">
      <label>Name
        <input type="text" class="player-name" value="Player ${index + 1}" maxlength="18" />
      </label>
      <label>ABV %
        <input type="number" class="player-abv" min="0" max="95" step="1" value="${defaultAbv}" />
      </label>
      <label>Level
        <select class="player-level">${createLevelOptions("medium")}</select>
      </label>
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
    const abv = Math.max(0, Math.min(95, Number(abvInput?.value || 0)));
    const level = levelInput?.value || "medium";
    return { name, abv, level };
  });
}

function renderPlayersConfirmation() {
  if (pendingPlayers.length < 3) {
    elements.playersConfirmation.innerHTML = `<p class="muted">Configure at least 3 players to continue.</p>`;
    return;
  }
  elements.playersConfirmation.innerHTML = pendingPlayers
    .map(
      (player, index) => `
      <article class="player-confirm-card">
        <h3>${index + 1}. ${player.name}</h3>
        <p>ABV ${player.abv}%</p>
        <p>Level ${player.level}</p>
      </article>
    `,
    )
    .join("");
}

function playerById(id) {
  if (!gameState) {
    return null;
  }
  return gameState.players.find((player) => player.id === id) ?? null;
}

function renderDeckAndTurnMeta() {
  if (!gameState) {
    return;
  }
  const activePlayer = getActivePlayer(gameState);
  const modifierText = gameState.halvedThresholdsActive ? " · Halved thresholds active" : "";
  elements.deckMeta.textContent = `Deck ${gameState.deck.length} · Discard ${gameState.discard.length}${modifierText}`;
  elements.turnMeta.textContent = `Turn ${gameState.turnNumber} · Active: ${activePlayer.name}`;
  elements.turnTitle.textContent = `${activePlayer.name}'s Turn`;
}

function renderScoreboard() {
  if (!gameState) {
    return;
  }
  const activeId = getActivePlayer(gameState).id;
  elements.scoreboard.innerHTML = gameState.players
    .map((player) => {
      const effectiveThreshold = getDisplayThreshold(player, gameState);
      const holdings = player.holdings.length
        ? `<div class="holdings">${player.holdings.map((holding) => `<span class="badge">${holding}</span>`).join("")}</div>`
        : `<div class="holdings muted">No held cards</div>`;
      return `
        <article class="player-card ${player.id === activeId ? "is-active" : ""}">
          <header>
            <h3>${player.name}</h3>
            <span class="level">${player.level}</span>
          </header>
          <p>ABV ${player.abv}% · Threshold ${effectiveThreshold} <span class="muted">(base ${player.threshold})</span></p>
          <p>Pending ${player.pendingPenalties} · Total ${player.totalPenalties}</p>
          <p>Drinks ${player.drinksTaken}</p>
          ${holdings}
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
      <span class="suit-label">${meta.label}</span>
    </article>
  `;
}

function renderForfeit(turn) {
  const notes = turn.forfeit.hostNotes.length
    ? `<ul>${turn.forfeit.hostNotes.map((note) => `<li>${note}</li>`).join("")}</ul>`
    : "";
  elements.forfeitView.innerHTML = `
    <h3>${turn.forfeit.title}</h3>
    <p>${turn.forfeit.text}</p>
    ${notes}
    <p class="muted">Suggested total penalties: ${turn.suggestedTotal}</p>
  `;
}

function renderPenaltyControls() {
  if (!gameState) {
    return;
  }
  const turn = gameState.currentTurn;
  if (!turn) {
    elements.penaltyControls.innerHTML = `<p class="muted">Draw a card to allocate penalties.</p>`;
    return;
  }
  const total = Object.values(turn.allocations).reduce((sum, value) => sum + value, 0);
  elements.penaltyControls.innerHTML = `
    <p class="penalty-header">Host allocation · Assigned ${total} / Suggested ${turn.suggestedTotal}</p>
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
  if (!gameState) {
    return;
  }
  if (!gameState.currentTurn) {
    elements.cardView.innerHTML = `<p class="muted">No card drawn yet.</p>`;
    elements.forfeitView.innerHTML = `<p class="muted">Forfeit details appear here.</p>`;
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
  if (!gameState) {
    return;
  }
  if (!lastDrinkAlerts.length) {
    return;
  }
  const text = lastDrinkAlerts
    .map((alert) => `${alert.name} drinks ${alert.drinksDue} (threshold ${alert.threshold})`)
    .join(" · ");
  elements.forfeitView.insertAdjacentHTML("afterbegin", `<p class="alert">${text}</p>`);
}

function renderEventLog() {
  if (!gameState) {
    return;
  }
  const latest = gameState.log.slice(0, 30);
  elements.eventLog.innerHTML = latest
    .map((entry) => `<article class="event ${entry.type}">${entry.message}</article>`)
    .join("");
}

function renderAll() {
  renderDeckAndTurnMeta();
  renderScoreboard();
  renderCurrentTurnArea();
  renderAlerts();
  renderEventLog();
}

function announce(message) {
  if (!gameState) {
    return;
  }
  gameState.log.unshift({ type: "system", message });
}

function handleConfirmPlayers() {
  const players = parsePlayersFromSetup();
  if (players.length < 3) {
    return;
  }
  pendingPlayers = players;
  renderPlayersConfirmation();
  setScreen("confirm");
}

function startGameFromConfirmation() {
  if (pendingPlayers.length < 3) {
    return;
  }
  const players = pendingPlayers.map((player) => ({ ...player }));
  gameState = createGame(players);
  lastDrinkAlerts = [];
  pendingPlayers = [];
  setScreen("game");
  renderAll();
}

function handleDrawCard() {
  if (!gameState) {
    return;
  }
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
  if (!gameState) {
    return;
  }
  const result = endTurn(gameState);
  if (!result.ok) {
    announce(result.message);
    renderAll();
    return;
  }
  lastDrinkAlerts = result.alerts;
  if (result.alerts.length === 0) {
    announce("No one crossed threshold this turn.");
  } else {
    const line = result.alerts.map((alert) => `${alert.name} x${alert.drinksDue}`).join(", ");
    announce(`Drink check: ${line}`);
  }
  renderAll();
}

function initPlayerCount() {
  elements.playerCount.innerHTML = Array.from({ length: 8 }, (_, index) => {
    const value = index + 3;
    const selected = value === 5 ? "selected" : "";
    return `<option value="${value}" ${selected}>${value}</option>`;
  }).join("");
}

function initEvents() {
  elements.generatePlayers.addEventListener("click", renderPlayerConfigRows);
  elements.playerCount.addEventListener("change", renderPlayerConfigRows);
  elements.confirmPlayers.addEventListener("click", handleConfirmPlayers);
  elements.editPlayers.addEventListener("click", () => {
    setScreen("add-players");
  });
  elements.startGame.addEventListener("click", startGameFromConfirmation);
  elements.newGame.addEventListener("click", () => {
    gameState = null;
    lastDrinkAlerts = [];
    pendingPlayers = [];
    renderPlayersConfirmation();
    setScreen("add-players");
  });
  elements.drawCard.addEventListener("click", handleDrawCard);
  elements.endTurn.addEventListener("click", handleEndTurn);
  elements.randomizePenalties.addEventListener("click", () => {
    if (!gameState) {
      return;
    }
    randomizeTurnPenalties(gameState);
    renderAll();
  });
  elements.resetPenalties.addEventListener("click", () => {
    if (!gameState) {
      return;
    }
    resetTurnPenalties(gameState);
    renderAll();
  });
}

function init() {
  initPlayerCount();
  renderPlayerConfigRows();
  renderPlayersConfirmation();
  initEvents();
  setScreen("add-players");
}

init();
