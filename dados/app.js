const CATEGORIES = [
  { key: "ones", label: "Unos" },
  { key: "twos", label: "Doses" },
  { key: "threes", label: "Treses" },
  { key: "fours", label: "Cuatros" },
  { key: "fives", label: "Cincos" },
  { key: "sixes", label: "Seises" },
  { key: "straight", label: "Escalera" },
  { key: "full", label: "Full" },
  { key: "poker", label: "Póker" },
  { key: "generala", label: "Generala" },
  { key: "doubleGenerala", label: "Doble Generala" }
];

const BAR_MESSAGES = {
  start: [
    "Arranca la timba. Aquí no se viene a empatar.",
    "Que ruede el cubilete.",
    "Se abre la barra y empiezan los dados.",
    "Hoy alguien sale leyenda del bar."
  ],
  roll: [
    "Eso ha sonado fino.",
    "Tirada con fundamento.",
    "Aquí huele a jugada seria.",
    "La mesa contiene la respiración.",
    "Ojo, que esta mano puede doler."
  ],
  good: [
    "Buena mano, criminal.",
    "Eso ya mete miedo.",
    "Tremendo viaje de dados.",
    "Hay nivel de tasca profesional."
  ],
  bad: [
    "Esto lo arregla otra ronda.",
    "Tirada peleona, pero fea.",
    "Ni tan mal... o sí.",
    "Hoy los dados vienen torcidos."
  ],
  score: [
    "Anotado. El siguiente que se retrate.",
    "Puntos al saco.",
    "La libreta no perdona.",
    "Se apunta y se sigue."
  ],
  win: [
    "Tenemos campeón del bar.",
    "Victoria para contarla mañana.",
    "Se corona la bestia.",
    "Esto merece aplauso y pincho."
  ]
};

const DOM = {
  setupScreen: document.getElementById("setupScreen"),
  gameScreen: document.getElementById("gameScreen"),
  endScreen: document.getElementById("endScreen"),
  numPlayers: document.getElementById("numPlayers"),
  playerNames: document.getElementById("playerNames"),
  startBtn: document.getElementById("startBtn"),
  turnTitle: document.getElementById("turnTitle"),
  roundInfo: document.getElementById("roundInfo"),
  rollsLeft: document.getElementById("rollsLeft"),
  diceArea: document.getElementById("diceArea"),
  rollBtn: document.getElementById("rollBtn"),
  scoreBtn: document.getElementById("scoreBtn"),
  scoreTable: document.getElementById("scoreTable"),
  barMessage: document.getElementById("barMessage"),
  rankingBox: document.getElementById("rankingBox"),
  winnerText: document.getElementById("winnerText"),
  finalSummary: document.getElementById("finalSummary"),
  playAgainBtn: document.getElementById("playAgainBtn"),
  newGameBtnTop: document.getElementById("newGameBtnTop"),
  resetRankingBtn: document.getElementById("resetRankingBtn"),
  leaderInfo: document.getElementById("leaderInfo"),
  soundToggle: document.getElementById("soundToggle")
};

const state = {
  players: [],
  currentPlayerIndex: 0,
  round: 1,
  dice: [1, 1, 1, 1, 1],
  locked: [false, false, false, false, false],
  rollsLeft: 3,
  isRolling: false,
  soundOn: true
};

let audioCtx = null;

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function initAudio() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) audioCtx = new Ctx();
  }
}

function playTone(freq = 440, duration = 0.06, type = "square", gainValue = 0.03) {
  if (!state.soundOn) return;
  initAudio();
  if (!audioCtx) return;

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = gainValue;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  const now = audioCtx.currentTime;
  gain.gain.setValueAtTime(gainValue, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.start(now);
  osc.stop(now + duration);
}

function playRollSound() {
  if (!state.soundOn) return;
  const notes = [240, 210, 270, 180, 220];
  notes.forEach((n, i) => {
    setTimeout(() => playTone(n, 0.05, "square", 0.025), i * 40);
  });
}

function playScoreSound() {
  playTone(523, 0.05, "square", 0.03);
  setTimeout(() => playTone(659, 0.07, "square", 0.03), 60);
}

function playWinSound() {
  [392, 523, 659, 784].forEach((n, i) => {
    setTimeout(() => playTone(n, 0.08, "square", 0.035), i * 90);
  });
}

function createPlayer(name) {
  const scorecard = {};
  CATEGORIES.forEach(cat => {
    scorecard[cat.key] = null;
  });

  return {
    name,
    scorecard,
    hasGenerala: false
  };
}

function buildPlayers() {
  const numPlayers = Number(DOM.numPlayers.value);
  const rawNames = DOM.playerNames.value
    .split("\n")
    .map(n => n.trim())
    .filter(Boolean);

  const players = [];
  for (let i = 0; i < numPlayers; i++) {
    const fallback = `Jugador ${i + 1}`;
    players.push(createPlayer(rawNames[i] || fallback));
  }
  return players;
}

function startGame() {
  state.players = buildPlayers();
  state.currentPlayerIndex = 0;
  state.round = 1;
  state.dice = [1, 1, 1, 1, 1];
  state.locked = [false, false, false, false, false];
  state.rollsLeft = 3;
  state.isRolling = false;

  DOM.setupScreen.classList.add("hidden");
  DOM.endScreen.classList.add("hidden");
  DOM.gameScreen.classList.remove("hidden");

  setBarMessage(randomFrom(BAR_MESSAGES.start));
  renderDice();
  updateHeader();
  renderScoreTable();
  renderRanking();
  updateControls();
}

function resetTurnState() {
  state.dice = [1, 1, 1, 1, 1];
  state.locked = [false, false, false, false, false];
  state.rollsLeft = 3;
  state.isRolling = false;
}

function getCurrentPlayer() {
  return state.players[state.currentPlayerIndex];
}

function countUsedCategories(player) {
  return CATEGORIES.filter(cat => player.scorecard[cat.key] !== null).length;
}

function updateHeader() {
  const player = getCurrentPlayer();
  DOM.turnTitle.textContent = `Turno de ${player.name}`;
  DOM.roundInfo.textContent = `Ronda ${state.round}`;
  DOM.rollsLeft.textContent = state.rollsLeft;
  updateLeaderInfo();
}

function updateLeaderInfo() {
  if (!state.players.length) {
    DOM.leaderInfo.textContent = "Sin líder todavía";
    return;
  }

  const totals = state.players.map(p => ({
    name: p.name,
    total: getPlayerTotal(p)
  })).sort((a, b) => b.total - a.total);

  if (totals.length === 0) {
    DOM.leaderInfo.textContent = "Sin líder todavía";
    return;
  }

  const leader = totals[0];
  DOM.leaderInfo.textContent = `Líder: ${leader.name} (${leader.total} pts)`;
}

function setBarMessage(text) {
  DOM.barMessage.textContent = text;
}

function rollSingleDie() {
  return Math.floor(Math.random() * 6) + 1;
}

async function rollDice() {
  if (state.isRolling || state.rollsLeft <= 0) return;

  state.isRolling = true;
  updateControls();
  playRollSound();
  setBarMessage(randomFrom(BAR_MESSAGES.roll));

  const diceEls = [...DOM.diceArea.querySelectorAll(".die")];
  diceEls.forEach((el, index) => {
    if (!state.locked[index]) el.classList.add("rolling");
  });

  const steps = 10;
  for (let s = 0; s < steps; s++) {
    for (let i = 0; i < state.dice.length; i++) {
      if (!state.locked[i]) {
        state.dice[i] = rollSingleDie();
      }
    }
    renderDice(false);
    await sleep(65);
  }

  for (let i = 0; i < state.dice.length; i++) {
    if (!state.locked[i]) {
      state.dice[i] = rollSingleDie();
    }
  }

  state.rollsLeft -= 1;
  state.isRolling = false;

  renderDice();
  updateHeader();
  renderScoreTable();
  updateControls();

  const bestCategory = getBestSuggestedCategory(getCurrentPlayer());
  if (bestCategory?.score >= 25) {
    setBarMessage(randomFrom(BAR_MESSAGES.good));
  } else {
    setBarMessage(randomFrom(BAR_MESSAGES.bad));
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function toggleLock(index) {
  if (state.isRolling) return;
  if (state.rollsLeft === 3) return;
  state.locked[index] = !state.locked[index];
  renderDice();
}

function getPipPositions(value) {
  const map = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8]
  };
  return map[value];
}

function createDieElement(value, index, interactive = true) {
  const die = document.createElement("button");
  die.type = "button";
  die.className = "die";
  if (state.locked[index]) die.classList.add("locked");
  if (state.isRolling && !state.locked[index]) die.classList.add("rolling");
  if (interactive) {
    die.addEventListener("click", () => toggleLock(index));
  }

  const visiblePips = getPipPositions(value);
  for (let i = 0; i < 9; i++) {
    const pip = document.createElement("span");
    pip.className = "pip";
    if (visiblePips.includes(i)) pip.classList.add("show");
    die.appendChild(pip);
  }
  return die;
}

function renderDice(interactive = true) {
  DOM.diceArea.innerHTML = "";
  state.dice.forEach((value, index) => {
    DOM.diceArea.appendChild(createDieElement(value, index, interactive));
  });
}

function getCounts(dice) {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  dice.forEach(d => counts[d]++);
  return counts;
}

function sumDice(dice) {
  return dice.reduce((acc, n) => acc + n, 0);
}

function isStraight(dice) {
  const sorted = [...dice].sort((a, b) => a - b).join(",");
  return sorted === "1,2,3,4,5" || sorted === "2,3,4,5,6";
}

function isFull(dice) {
  const values = Object.values(getCounts(dice)).filter(v => v > 0).sort((a, b) => a - b);
  return values.length === 2 && values[0] === 2 && values[1] === 3;
}

function isPoker(dice) {
  return Object.values(getCounts(dice)).some(v => v >= 4);
}

function isGenerala(dice) {
  return Object.values(getCounts(dice)).some(v => v === 5);
}

function calculateCategoryScore(player, categoryKey, dice) {
  const counts = getCounts(dice);

  switch (categoryKey) {
    case "ones": return counts[1] * 1;
    case "twos": return counts[2] * 2;
    case "threes": return counts[3] * 3;
    case "fours": return counts[4] * 4;
    case "fives": return counts[5] * 5;
    case "sixes": return counts[6] * 6;
    case "straight": return isStraight(dice) ? 20 : 0;
    case "full": return isFull(dice) ? 30 : 0;
    case "poker": return isPoker(dice) ? 40 : 0;
    case "generala": return isGenerala(dice) ? 50 : 0;
    case "doubleGenerala":
      return player.hasGenerala && isGenerala(dice) ? 100 : 0;
    default:
      return 0;
  }
}

function getPossibleScores(player) {
  const result = {};
  CATEGORIES.forEach(cat => {
    if (player.scorecard[cat.key] === null) {
      result[cat.key] = calculateCategoryScore(player, cat.key, state.dice);
    }
  });
  return result;
}

function getBestSuggestedCategory(player) {
  const possible = getPossibleScores(player);
  let best = null;

  for (const cat of CATEGORIES) {
    if (possible[cat.key] === undefined) continue;
    const entry = { key: cat.key, label: cat.label, score: possible[cat.key] };
    if (!best || entry.score > best.score) best = entry;
  }

  return best;
}

function scoreCellText(player, catKey) {
  if (player.scorecard[catKey] !== null) {
    return player.scorecard[catKey];
  }
  return "";
}

function getPlayerTotal(player) {
  return CATEGORIES.reduce((acc, cat) => {
    const val = player.scorecard[cat.key];
    return acc + (typeof val === "number" ? val : 0);
  }, 0);
}

function renderScoreTable() {
  const currentPlayer = getCurrentPlayer();
  const possibleScores = currentPlayer ? getPossibleScores(currentPlayer) : {};

  let html = "<thead><tr><th>Categoría</th>";
  state.players.forEach((player, index) => {
    html += `<th>${escapeHtml(player.name)}<br><small>${getPlayerTotal(player)} pts</small></th>`;
  });
  html += "</tr></thead><tbody>";

  CATEGORIES.forEach(cat => {
    html += `<tr><td class="category-name">${cat.label}</td>`;

    state.players.forEach((player, playerIndex) => {
      const used = player.scorecard[cat.key] !== null;
      let cls = "";
      let content = "";

      if (used) {
        cls = "used-score";
        content = scoreCellText(player, cat.key);
      } else if (playerIndex === state.currentPlayerIndex) {
        cls = "available-score";
        content = possibleScores[cat.key];
      } else {
        cls = "blocked-score";
        content = "";
      }

      const currentClass = playerIndex === state.currentPlayerIndex ? " current-cell" : "";
      html += `<td class="${cls}${currentClass}" data-player="${playerIndex}" data-cat="${cat.key}">${content}</td>`;
    });

    html += "</tr>";
  });

  html += "</tbody><tfoot><tr><td class='category-name'>TOTAL</td>";
  state.players.forEach(player => {
    html += `<td class="used-score">${getPlayerTotal(player)}</td>`;
  });
  html += "</tr></tfoot>";

  DOM.scoreTable.innerHTML = html;

  [...DOM.scoreTable.querySelectorAll("td[data-player][data-cat]")].forEach(td => {
    const playerIndex = Number(td.dataset.player);
    const catKey = td.dataset.cat;
    if (playerIndex === state.currentPlayerIndex) {
      const player = getCurrentPlayer();
      if (player.scorecard[catKey] === null) {
        td.style.cursor = "pointer";
        td.title = "Pulsa para anotar esta categoría";
        td.addEventListener("click", () => chooseCategory(catKey));
      }
    }
  });
}

function chooseCategory(catKey) {
  const player = getCurrentPlayer();
  if (player.scorecard[catKey] !== null) return;

  const score = calculateCategoryScore(player, catKey, state.dice);
  player.scorecard[catKey] = score;

  if (catKey === "generala" && score > 0) {
    player.hasGenerala = true;
  }

  playScoreSound();
  setBarMessage(`${player.name} anota ${score} en ${getCategoryLabel(catKey)}. ${randomFrom(BAR_MESSAGES.score)}`);

  if (isGameFinished()) {
    finishGame();
    return;
  }

  nextPlayer();
}

function getCategoryLabel(catKey) {
  const found = CATEGORIES.find(c => c.key === catKey);
  return found ? found.label : catKey;
}

function nextPlayer() {
  state.currentPlayerIndex += 1;

  if (state.currentPlayerIndex >= state.players.length) {
    state.currentPlayerIndex = 0;
    state.round += 1;
  }

  resetTurnState();
  updateHeader();
  renderDice();
  renderScoreTable();
  updateControls();

  const player = getCurrentPlayer();
  const suggestion = getBestSuggestedCategory(player);
  if (suggestion) {
    setBarMessage(`Turno de ${player.name}. Objetivo sugerido: ${suggestion.label}.`);
  } else {
    setBarMessage(`Turno de ${player.name}.`);
  }
}

function isGameFinished() {
  return state.players.every(player =>
    CATEGORIES.every(cat => player.scorecard[cat.key] !== null)
  );
}

function finishGame() {
  const standings = [...state.players]
    .map(player => ({
      name: player.name,
      total: getPlayerTotal(player)
    }))
    .sort((a, b) => b.total - a.total);

  const winner = standings[0];
  saveWinnerToRanking(winner.name, winner.total);

  DOM.gameScreen.classList.add("hidden");
  DOM.endScreen.classList.remove("hidden");

  DOM.winnerText.textContent = `🏆 Gana ${winner.name} con ${winner.total} puntos.`;
  DOM.finalSummary.innerHTML = standings
    .map((row, index) => `
      <div class="final-row">
        <span>${index + 1}. ${escapeHtml(row.name)}</span>
        <strong>${row.total} pts</strong>
      </div>
    `)
    .join("");

  playWinSound();
  setBarMessage(randomFrom(BAR_MESSAGES.win));
  renderRanking();
}

function updateControls() {
  DOM.rollBtn.disabled = state.isRolling || state.rollsLeft <= 0;
  DOM.scoreBtn.disabled = state.isRolling || state.rollsLeft === 3;
}

function forceBestCategory() {
  const player = getCurrentPlayer();
  const best = getBestSuggestedCategory(player);
  if (best) chooseCategory(best.key);
}

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getRanking() {
  try {
    return JSON.parse(localStorage.getItem("generalaRankingV1") || "[]");
  } catch {
    return [];
  }
}

function saveWinnerToRanking(name, points) {
  const ranking = getRanking();
  ranking.push({
    name,
    points,
    date: new Date().toLocaleString("es-ES")
  });

  ranking.sort((a, b) => b.points - a.points);
  localStorage.setItem("generalaRankingV1", JSON.stringify(ranking.slice(0, 10)));
}

function renderRanking() {
  const ranking = getRanking();

  if (!ranking.length) {
    DOM.rankingBox.innerHTML = `<div class="ranking-row"><span>Sin partidas guardadas todavía</span><strong>—</strong></div>`;
    return;
  }

  DOM.rankingBox.innerHTML = ranking.map((row, index) => `
    <div class="ranking-row">
      <span>${index + 1}. ${escapeHtml(row.name)} <small class="muted">(${escapeHtml(row.date)})</small></span>
      <strong>${row.points} pts</strong>
    </div>
  `).join("");
}

function resetRanking() {
  localStorage.removeItem("generalaRankingV1");
  renderRanking();
  setBarMessage("Ranking borrado. Aquí no ha pasado nada.");
}

function restartToSetup() {
  DOM.endScreen.classList.add("hidden");
  DOM.gameScreen.classList.add("hidden");
  DOM.setupScreen.classList.remove("hidden");
  renderRanking();
}

function toggleSound() {
  state.soundOn = !state.soundOn;
  DOM.soundToggle.textContent = state.soundOn ? "🔊 Sonido: ON" : "🔈 Sonido: OFF";
  if (state.soundOn) {
    playTone(500, 0.04, "square", 0.025);
  }
}

DOM.startBtn.addEventListener("click", startGame);
DOM.rollBtn.addEventListener("click", rollDice);
DOM.scoreBtn.addEventListener("click", forceBestCategory);
DOM.playAgainBtn.addEventListener("click", restartToSetup);
DOM.newGameBtnTop.addEventListener("click", restartToSetup);
DOM.resetRankingBtn.addEventListener("click", resetRanking);
DOM.soundToggle.addEventListener("click", toggleSound);

renderRanking();
