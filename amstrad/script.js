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
   CLEAR (🔥 NUEVO)
====================== */
function clearScreen() {
  output.innerHTML = "";

  // reset estado
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

  const time = now.toLocaleTimeString("es-ES", { hour12: false });
  const date = now.toLocaleDateString("es-ES");

  clock.innerHTML = `${time}<br>${date}`;
}
setInterval(updateClock, 1000);
updateClock();

/* ======================
   MODOS CPC
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
   WIKIPEDIA
====================== */
async function searchWikipedia(query, full = false) {
  print("Consultando base de datos...");

  try {
    let url;

    if (full) {
      url = `https://es.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&titles=${encodeURIComponent(query)}&format=json&origin=*`;
    } else {
      url = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    let text = "";
    let title = query;

    if (full) {
      const page = Object.values(data.query.pages)[0];

      if (!page.extract || page.missing !== undefined) {
        return searchWikipediaFallback(query);
      }

      text = page.extract;
      title = page.title;

    } else {
      const isDisambiguation =
        data.type === "disambiguation" ||
        (data.extract && data.extract.toLowerCase().includes("puede referirse a"));

      if (isDisambiguation || !data.extract) {
        return searchWikipediaFallback(query);
      }

      text = data.extract;
      title = data.title;
    }

    waitingSelection = false;
    selectionMode = null;
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
  try {
    const url = `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();

    const results = data.query.search;

    if (!results || results.length === 0) {
      print("No encontrado.");
      return;
    }

    wikiOptions = results.slice(0, 6);
    waitingSelection = true;
    selectionMode = "wiki";

    print("Puede referirse a:");

    wikiOptions.forEach((r, i) => {
      print(`${i + 1}. ${r.title}`);
    });

    print("Selecciona número...");
  } catch {
    print("Error.");
  }
}

/* ======================
   NEWS
====================== */
function loadNewsAI() {
  loadRSS("https://feeds.bbci.co.uk/news/technology/rss.xml", "AI / TECH NEWS");
}

function loadNewsCOM() {
  loadRSS("https://rss.sciam.com/ScientificAmerican-Global", "SCIENCE NEWS");
}

/* ======================
   RSS (FIX ESTABLE)
====================== */
async function loadRSS(feed, title) {
  print("Cargando noticias...");

  try {
    const proxy = "https://api.allorigins.win/get?url=" + encodeURIComponent(feed);
    const res = await fetch(proxy);
    const data = await res.json();

    const xml = new DOMParser().parseFromString(data.contents, "text/xml");
    const items = xml.querySelectorAll("item");

    if (!items.length) {
      print("No hay noticias.");
      return;
    }

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
  } catch (err) {
    print("Error RSS.");
    console.error(err);
  }
}

/* ======================
   COMANDOS
====================== */
function runCommand(cmd) {
  const clean = cmd.trim();
  print("> " + cmd);

  /* selección */
  if (waitingSelection && !isNaN(clean)) {
    const i = parseInt(clean) - 1;

    if (selectionMode === "wiki" && wikiOptions[i]) {
      waitingSelection = false;
      searchWikipedia(wikiOptions[i].title);
      return;
    }

    if (selectionMode === "news" && newsOptions[i]) {
      waitingSelection = false;
      window.open(newsOptions[i].link, "_blank");
      return;
    }

    print("Opción inválida.");
    return;
  }

  const command = clean.toUpperCase();

  if (command === "HELP") {
    print("WIKI / WIKI+ / MORE");
    print("NEWS / NEWS COM");
    print("MODE 1 / MODE 2");
    print("CLEAR / ABOUT");
    return;
  }

  if (command === "CLEAR") return clearScreen();

  if (command === "ABOUT") {
    print("GUARDOVICH CPC SYSTEM");
    print("Retro Terminal + Wikipedia + RSS");
    print("Powered by Guardovich Technologies");
    return;
  }

  if (command === "MORE") return showMore();
  if (command === "MODE 1") return setMode(1);
  if (command === "MODE 2") return setMode(2);
  if (command === "NEWS") return loadNewsAI();
  if (command === "NEWS COM") return loadNewsCOM();

  if (command.startsWith("WIKI+ ")) return searchWikipedia(clean.slice(6), true);
  if (command.startsWith("WIKI ")) return searchWikipedia(clean.slice(5));

  print("Syntax Error");
  beep(200, 100);
}

/* INPUT */
input.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    runCommand(input.value);
    input.value = "";
  }
});

/* INIT */
startBoot();
