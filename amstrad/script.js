const boot = document.getElementById("boot");
const terminal = document.getElementById("terminal");
const input = document.getElementById("commandInput");
const output = document.getElementById("output");

/* ======================
   ESTADO
====================== */
let wikiOptions = [];
let newsOptions = [];
let waitingSelection = false;
let selectionMode = null; // "wiki" o "news"

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
   WIKIPEDIA
====================== */
async function searchWikipedia(query) {
  print("Consultando base de datos...");

  try {
    const url = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
    const res = await fetch(url);

    if (!res.ok) return searchWikipediaFallback(query);

    const data = await res.json();

    const isDisambiguation =
      data.type === "disambiguation" ||
      (data.extract && data.extract.toLowerCase().includes("puede referirse a"));

    if (isDisambiguation) {
      print("Entrada ambigua. Buscando opciones...");
      return searchWikipediaFallback(query);
    }

    if (data.extract) {
      wikiOptions = [];
      waitingSelection = false;
      selectionMode = null;

      print("-----");
      print(data.title.toUpperCase());
      print("-----");

      const lines = splitText(data.extract);
      lines.forEach(line => print(line));
    } else {
      searchWikipediaFallback(query);
    }

  } catch {
    print("Error de conexión.");
  }
}

/* ======================
   FALLBACK WIKI
====================== */
async function searchWikipediaFallback(query) {
  try {
    const url = `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();

    const results = data.query.search;

    if (results.length > 0) {
      wikiOptions = results.slice(0, 5);
      waitingSelection = true;
      selectionMode = "wiki";

      print("Puede referirse a:");

      wikiOptions.forEach((r, i) => {
        print(`${i + 1}. ${r.title}`);
      });

      print("Selecciona número...");
    } else {
      print("No encontrado.");
    }

  } catch {
    print("Error.");
  }
}

/* ======================
   NEWS RSS
====================== */
async function loadNewsAI() {
  print("Cargando noticias de IA...");

  try {
    const rssUrl = encodeURIComponent("https://feeds.bbci.co.uk/news/technology/rss.xml");
    const url = `https://api.allorigins.win/raw?url=${rssUrl}`;

    const res = await fetch(url);
    const text = await res.text();

    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "text/xml");

    const items = xml.querySelectorAll("item");

    newsOptions = [];
    waitingSelection = true;
    selectionMode = "news";

    print("-----");
    print("AI / TECH NEWS");
    print("-----");

    let count = 0;

    items.forEach(item => {
      if (count >= 5) return;

      const title = item.querySelector("title")?.textContent;
      const link = item.querySelector("link")?.textContent;

      if (title && link) {
        newsOptions.push({ title, link });
        print(`${count + 1}. ${title}`);
        count++;
      }
    });

    print("Selecciona número para abrir noticia...");
  } catch {
    print("Error cargando noticias.");
  }
}

/* ======================
   COMANDOS
====================== */
function runCommand(cmd) {
  const clean = cmd.trim();

  print("> " + cmd);

  /* 🔥 SELECCIÓN UNIVERSAL */
  if (waitingSelection && !isNaN(clean)) {
    const index = parseInt(clean) - 1;

    if (selectionMode === "wiki" && wikiOptions[index]) {
      const selected = wikiOptions[index].title;

      waitingSelection = false;
      wikiOptions = [];
      selectionMode = null;

      print("Cargando: " + selected);
      searchWikipedia(selected);
      return;
    }

    if (selectionMode === "news" && newsOptions[index]) {
      const selected = newsOptions[index];

      waitingSelection = false;
      newsOptions = [];
      selectionMode = null;

      print("Abriendo noticia...");
      window.open(selected.link, "_blank");
      return;
    }

    print("Opción inválida.");
    return;
  }

  const command = clean.toUpperCase();

  if (command === "HELP") {
    print("COMANDOS:");
    print("WIKI [tema]");
    print("NEWS");
    print("CLEAR");
    print("ABOUT");
    return;
  }

  if (command === "CLEAR") {
    output.innerHTML = "";
    wikiOptions = [];
    newsOptions = [];
    waitingSelection = false;
    selectionMode = null;
    return;
  }

  if (command === "ABOUT") {
    print("GUARDOVICH CPC SYSTEM");
    print("Wikipedia + Noticias IA");
    return;
  }

  if (command.startsWith("WIKI ")) {
    searchWikipedia(clean.slice(5));
    return;
  }

  if (command === "NEWS" || command === "NEWS AI") {
    loadNewsAI();
    return;
  }

  print("Syntax Error");
  beep(200, 100);
}

/* INPUT */
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    runCommand(input.value);
    input.value = "";
  }
});

/* INIT */
startBoot();
