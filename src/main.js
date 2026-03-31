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
  setupHint: document.querySelector("#setup-hint"),
  addPlayer: document.querySelector("#add-player"),
  playersConfig: document.querySelector("#players-config"),
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
let setupPlayers = [];

function setScreen(screen) {
  if (screen === "setup") {
    elements.setupScreen.classList.remove("hidden");
    elements.gameScreen.classList.add("hidden");
    return;
  }
  elements.setupScreen.classList.add("hidden");
  elements.gameScreen.classList.remove("hidden");
}

function createLevelOptions(selected) {
  return LEVEL_OPTIONS.map((level) => {
    const picked = level === selected ? "selected" : "";
    return `<option value="${level}" ${picked}>${level}</option>`;
  }).join("");
}

function createPlayerConfigRow(player, index) {
  return `
    <article class="player-config-row" data-row-index="${index}">
      <label>Name
        <input type="text" class="player-name" value="${player.name}" maxlength="18" />
      </label>
      <label>ABV %
        <input type="number" class="player-abv" min="0" max="95" step="1" value="${player.abv}" />
      </label>
      <label>Level
        <select class="player-level">${createLevelOptions(player.level)}</select>
      </label>
      <button type="button" class="remove-player" data-remove-index="${index}" ${setupPlayers.length <= 3 ? "disabled" : ""}>Remove</button>
    </article>
  `;
}

function setupHintText() {
  return `Players: ${setupPlayers.length} (min 3 · max 8)`;
}

function buildDefaultPlayer(index) {
  const defaultAbv = index % 3 === 0 ? 5 : index % 3 === 1 ? 25 : 40;
  return {
    name: `Player ${index + 1}`,
    abv: defaultAbv,
    level: "medium",
  };
}

function syncSetupPlayersFromDom() {
  const rows = [...elements.playersConfig.querySelectorAll(".player-config-row")];
  if (!rows.length) {
    return;
  }
  setupPlayers = rows.map((row, index) => {
    const nameInput = row.querySelector(".player-name");
    const abvInput = row.querySelector(".player-abv");
    const levelInput = row.querySelector(".player-level");
    return {
      name: (nameInput?.value || "").trim() || `Player ${index + 1}`,
      abv: Math.max(0, Math.min(95, Number(abvInput?.value || 0))),
      level: levelInput?.value || "medium",
    };
  });
}

function renderPlayerConfigRows() {
  elements.playersConfig.innerHTML = setupPlayers.map((player, index) => createPlayerConfigRow(player, index)).join("");
  elements.setupHint.textContent = setupHintText();
  [...elements.playersConfig.querySelectorAll(".remove-player")].forEach((button) => {
    button.addEventListener("click", (event) => {
      if (setupPlayers.length <= 3) {
        return;
      }
      syncSetupPlayersFromDom();
      const removeIndex = Number(event.currentTarget.getAttribute("data-remove-index"));
      if (!Number.isNaN(removeIndex)) {
        setupPlayers.splice(removeIndex, 1);
      }
      renderPlayerConfigRows();
    });
  });
}

function parsePlayersFromSetup() {
  syncSetupPlayersFromDom();
  return [...setupPlayers];
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

function startGameFromSetup() {
  const players = parsePlayersFromSetup();
  if (players.length < 3 || players.length > 8) {
    elements.setupHint.textContent = "Picante needs 3 to 8 players.";
    return;
  }
  const uniqueNames = new Set(players.map((player) => player.name.toLowerCase()));
  if (uniqueNames.size !== players.length) {
    elements.setupHint.textContent = "Player names must be unique.";
    return;
  }
  gameState = createGame(players);
  lastDrinkAlerts = [];
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

function initEvents() {
  elements.addPlayer.addEventListener("click", () => {
    if (setupPlayers.length >= 8) {
      return;
    }
    syncSetupPlayersFromDom();
    setupPlayers.push(buildDefaultPlayer(setupPlayers.length));
    renderPlayerConfigRows();
  });
  elements.startGame.addEventListener("click", startGameFromSetup);
  elements.newGame.addEventListener("click", () => {
    gameState = null;
    lastDrinkAlerts = [];
    setupPlayers = Array.from({ length: 5 }, (_, index) => buildDefaultPlayer(index));
    renderPlayerConfigRows();
    setScreen("setup");
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
  setupPlayers = Array.from({ length: 5 }, (_, index) => buildDefaultPlayer(index));
  renderPlayerConfigRows();
  initEvents();
  setScreen("setup");
}

init();
