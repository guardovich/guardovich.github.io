const input = document.getElementById("commandInput");
const output = document.getElementById("output");

/* ESTADO GLOBAL */
let wikiOptions = [];

/* PRINT */
function print(text) {
  const p = document.createElement("p");
  p.textContent = text;
  output.appendChild(p);
  output.scrollTop = output.scrollHeight;
}

/* SPLIT TEXTO */
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

/* SONIDO */
function beep(freq = 600, duration = 50) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.value = freq;
    osc.type = "square";

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();

    setTimeout(() => {
      osc.stop();
      ctx.close();
    }, duration);
  } catch {
    // por si falla audio en algún navegador
  }
}

/* =========================
   WIKIPEDIA PRINCIPAL
========================= */
async function searchWikipedia(query) {
  print("Consultando base de datos...");

  try {
    const cleanQuery = query.trim();

    const url = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanQuery)}`;
    const res = await fetch(url);

    if (!res.ok) {
      print("No encontrado. Probando búsqueda...");
      return searchWikipediaFallback(cleanQuery);
    }

    const data = await res.json();

    if (data.extract) {
      wikiOptions = []; // reset opciones

      print("-----");
      print(data.title.toUpperCase());
      print("-----");

      if (data.thumbnail && data.thumbnail.source) {
        const img = document.createElement("img");
        img.src = data.thumbnail.source;
        img.style.width = "120px";
        img.style.margin = "10px 0";
        output.appendChild(img);
      }

      const lines = splitText(data.extract);
      lines.forEach(line => print(line));

    } else {
      searchWikipediaFallback(cleanQuery);
    }

  } catch {
    print("Error de conexión.");
  }
}

/* =========================
   FALLBACK + DESAMBIGUACIÓN
========================= */
async function searchWikipediaFallback(query) {
  try {
    const searchUrl = `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;

    const res = await fetch(searchUrl);
    const data = await res.json();

    const results = data.query.search;

    if (results.length > 0) {
      print("Puede referirse a:");

      wikiOptions = results.slice(0, 5);

      wikiOptions.forEach((item, index) => {
        print(`${index + 1}. ${item.title}`);
      });

      print("Selecciona número...");
    } else {
      print("No se encontró información.");
    }

  } catch {
    print("Error en búsqueda.");
  }
}

/* =========================
   COMANDOS
========================= */
function runCommand(cmd) {
  const command = cmd.trim().toUpperCase();

  print("> " + cmd);

  /* SELECCIÓN DE OPCIONES WIKI */
  if (!isNaN(cmd.trim()) && wikiOptions.length > 0) {
    const index = parseInt(cmd) - 1;

    if (wikiOptions[index]) {
      const selected = wikiOptions[index].title;
      wikiOptions = [];

      print("Cargando: " + selected);
      beep(800, 50);

      searchWikipedia(selected);
      return;
    }
  }

  /* HELP */
  if (command === "HELP") {
    print("COMANDOS:");
    print("WIKI [tema]");
    print("CLEAR");
    print("ABOUT");
    return;
  }

  /* CLEAR */
  if (command === "CLEAR") {
    output.innerHTML = "";
    wikiOptions = [];
    return;
  }

  /* ABOUT */
  if (command === "ABOUT") {
    print("GUARDOVICH CPC SYSTEM");
    print("Wikipedia integrada");
    print("Modo retro interactivo");
    return;
  }

  /* WIKI */
  if (command.startsWith("WIKI ")) {
    const query = cmd.slice(5);
    searchWikipedia(query);
    return;
  }

  /* ERROR */
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
