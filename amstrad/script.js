const boot = document.getElementById("boot");
const terminal = document.getElementById("terminal");
const input = document.getElementById("commandInput");
const output = document.getElementById("output");
const screen = document.getElementById("screen");
const modeLabel = document.getElementById("modeLabel");

/* ======================
   ESTADO
====================== */
let wikiOptions = [];
let newsOptions = [];
let waitingSelection = false;
let selectionMode = null;

let currentText = [];
let currentIndex = 0;

/* 🔥 NUEVO */
let commandHistory = [];
let historyIndex = -1;

let editorMode = false;
let editorBuffer = [];

/* ======================
   PRINT
====================== */
function print(text) {
  const p = document.createElement("p");
  p.textContent = text;
  output.appendChild(p);
  output.scrollTop = output.scrollHeight;
}

/* ======================
   CLEAR
====================== */
function clearScreen() {
  output.innerHTML = "";
  wikiOptions = [];
  newsOptions = [];
  waitingSelection = false;
  selectionMode = null;
  currentText = [];
  currentIndex = 0;
}

/* ======================
   SONIDO
====================== */
function beep(freq = 800, duration = 80) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.frequency.value = freq;
    osc.connect(ctx.destination);
    osc.start();
    setTimeout(() => osc.stop(), duration);
  } catch {}
}

/* ======================
   RELOJ
====================== */
function updateClock() {
  const clock = document.getElementById("clock");
  const now = new Date();

  clock.innerHTML = `${now.toLocaleTimeString("es-ES", {hour12:false})}<br>${now.toLocaleDateString("es-ES")}`;
}
setInterval(updateClock, 1000);
updateClock();

/* ======================
   MODOS
====================== */
function setMode(mode) {
  screen.classList.remove("mode1", "mode2");

  if (mode === 2) {
    screen.classList.add("mode2");
    modeLabel.textContent = "MODE: 2";
  } else {
    screen.classList.add("mode1");
    modeLabel.textContent = "MODE: 1";
  }

  print("Modo cambiado.");
}

/* ======================
   BOOT
====================== */
function startBoot() {
  const lines = [
    "Amstrad Consumer Electronics plc",
    "BASIC 1.0",
    "64K RAM SYSTEM",
    "",
    "Ready"
  ];

  let i = 0;

  function typeLine() {
    if (i >= lines.length) {
      setTimeout(() => {
        boot.style.display = "none";
        terminal.style.display = "flex";
        input.focus();
      }, 400);
      return;
    }

    const p = document.createElement("p");
    boot.appendChild(p);

    let j = 0;
    const text = lines[i];

    const interval = setInterval(() => {
      p.textContent += text[j] || "";
      j++;

      if (j > text.length) {
        clearInterval(interval);
        i++;
        setTimeout(typeLine, 200);
      }
    }, 20);
  }

  beep(1200, 50);
  typeLine();
}

/* ======================
   TEXTO
====================== */
function splitText(text, maxLength = 60) {
  const words = text.split(" ");
  let lines = [];
  let current = "";

  words.forEach(word => {
    if ((current + word).length > maxLength) {
      lines.push(current);
      current = word + " ";
    } else {
      current += word + " ";
    }
  });

  lines.push(current);
  return lines;
}

/* ======================
   PAGINACIÓN
====================== */
function showMore() {
  const chunk = currentText.slice(currentIndex, currentIndex + 10);

  chunk.forEach(line => print(line));
  currentIndex += 10;

  if (currentIndex < currentText.length) {
    print("-- MORE --");
  }
}

/* ======================
   WIKI
====================== */
async function searchWikipedia(query, full = false) {
  print("Consultando base de datos...");

  try {
    let url = full
      ? `https://es.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&titles=${encodeURIComponent(query)}&format=json&origin=*`
      : `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;

    const res = await fetch(url);
    const data = await res.json();

    let text = "";
    let title = query;

    if (full) {
      const page = Object.values(data.query.pages)[0];
      if (!page.extract) return searchWikipediaFallback(query);
      text = page.extract;
      title = page.title;
    } else {
      if (!data.extract || data.type === "disambiguation") {
        return searchWikipediaFallback(query);
      }
      text = data.extract;
      title = data.title;
    }

    waitingSelection = false;
    wikiOptions = [];

    print("-----");
    print(title.toUpperCase());
    print("-----");

    currentText = splitText(text);
    currentIndex = 0;
    showMore();

  } catch {
    print("Error de conexión.");
  }
}

/* ======================
   FALLBACK
====================== */
async function searchWikipediaFallback(query) {
  const url = `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
  const res = await fetch(url);
  const data = await res.json();

  wikiOptions = data.query.search.slice(0, 5);
  waitingSelection = true;
  selectionMode = "wiki";

  print("Puede referirse a:");
  wikiOptions.forEach((r, i) => print(`${i + 1}. ${r.title}`));
  print("Selecciona número...");
}

/* ======================
   RSS
====================== */
async function loadRSS(feed, title) {
  print("Cargando noticias...");

  try {
    const proxy = "https://api.allorigins.win/get?url=" + encodeURIComponent(feed);
    const res = await fetch(proxy);
    const data = await res.json();

    const xml = new DOMParser().parseFromString(data.contents, "text/xml");
    const items = xml.querySelectorAll("item");

    newsOptions = [];
    waitingSelection = true;
    selectionMode = "news";

    print("-----");
    print(title);
    print("-----");

    let count = 0;

    items.forEach(item => {
      if (count >= 5) return;
      const t = item.querySelector("title")?.textContent;
      const link = item.querySelector("link")?.textContent;

      if (t && link) {
        newsOptions.push({ title: t, link });
        print(`${count + 1}. ${t}`);
        count++;
      }
    });

    print("Selecciona número...");
  } catch {
    print("Error RSS.");
  }
}

/* ======================
   EDITOR CPC 🔥
====================== */
function startEditor() {
  editorMode = true;
  editorBuffer = [];
  print("--- EDITOR MODE ---");
  print("ESC para salir | SAVE para guardar");
}

function saveFile() {
  const blob = new Blob([editorBuffer.join("\n")], { type: "text/markdown" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "guardovich.md";
  a.click();

  print("Archivo descargado.");
}

function loadFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    editorBuffer = e.target.result.split("\n");
    editorBuffer.forEach(line => print(line));
  };
  reader.readAsText(file);
}

/* ======================
   COMANDOS
====================== */
function runCommand(cmd) {
  const clean = cmd.trim();

  /* 🔥 EDITOR MODE */
  if (editorMode) {
    if (clean.toUpperCase() === "SAVE") return saveFile();
    if (clean === "EXIT") {
      editorMode = false;
      print("Saliendo del editor...");
      return;
    }

    editorBuffer.push(clean);
    print(clean);
    return;
  }

  print("> " + cmd);

  commandHistory.push(cmd);
  historyIndex = commandHistory.length;

  if (waitingSelection && !isNaN(clean)) {
    const i = parseInt(clean) - 1;

    if (selectionMode === "wiki") return searchWikipedia(wikiOptions[i].title);
    if (selectionMode === "news") return window.open(newsOptions[i].link);

    return;
  }

  const command = clean.toUpperCase();

  if (command === "HELP") {
    print("WIKI / WIKI+ / MORE");
    print("NEWS / MODE");
    print("EDIT / SAVE");
    print("CLEAR / ABOUT");
    return;
  }

  if (command === "EDIT") return startEditor();
  if (command === "CLEAR") return clearScreen();
  if (command === "MODE 1") return setMode(1);
  if (command === "MODE 2") return setMode(2);

  if (command === "NEWS") return loadRSS("https://feeds.bbci.co.uk/news/technology/rss.xml", "AI NEWS");

  if (command.startsWith("WIKI ")) return searchWikipedia(clean.slice(5));

  if (command === "ABOUT") {
    print("GUARDOVICH CPC SYSTEM");
    print("Retro + Wikipedia + RSS + Editor");
    return;
  }

  print("Syntax Error");
  beep(200, 100);
}

/* ======================
   INPUT + HISTORIAL
====================== */
input.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    runCommand(input.value);
    input.value = "";
  }

  if (e.key === "ArrowUp") {
    if (historyIndex > 0) {
      historyIndex--;
      input.value = commandHistory[historyIndex];
    }
  }

  if (e.key === "ArrowDown") {
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      input.value = commandHistory[historyIndex];
    } else {
      input.value = "";
    }
  }
});

/* ======================
   INIT
====================== */
startBoot();
