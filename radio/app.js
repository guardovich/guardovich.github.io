/* ======================
   CONFIG
====================== */

const streams = {
  main: "https://stream.laut.fm/metal",                // puede tener ads
  clean: "https://ice4.somafm.com/metal-128-mp3"       // sin ads
};

const feeds = [
  // 🌍 tecnología / medios
  "https://feeds.bbci.co.uk/news/technology/rss.xml",
  "https://www.niemanlab.org/feed/",
  "https://www.xataka.com/feed.xml",

  // 🔥 REDDIT (FORO)
  "https://www.reddit.com/r/spain/.rss",
  "https://www.reddit.com/r/technology/.rss",
  "https://www.reddit.com/r/artificial/.rss"
];

/* ======================
   AUDIO
====================== */

const audio = document.getElementById("audio");
const status = document.getElementById("status");

function playStream(tipo) {
  const url = streams[tipo];

  audio.src = url;

  audio.play()
    .then(() => {
      setActiveButton(tipo);

      if (tipo === "main") {
        status.innerHTML = '>> <span class="live">LIVE</span> ROCK/METAL';
      } else {
        status.innerHTML = '>> <span class="live">LIVE</span> METAL CLEAN';
      }
    })
    .catch(err => {
      status.textContent = ">> ERROR STREAM";
      console.error(err);
    });
}

function stop() {
  audio.pause();
  audio.src = "";
  status.textContent = ">> STOPPED";

  // quitar botón activo
  document.querySelectorAll("button").forEach(btn => {
    btn.classList.remove("active");
  });
}

/* ======================
   BOTÓN ACTIVO
====================== */

function setActiveButton(tipo) {
  const buttons = document.querySelectorAll(".controls button");

  buttons.forEach(btn => btn.classList.remove("active"));

  if (tipo === "main") {
    buttons[0].classList.add("active");
  } else if (tipo === "clean") {
    buttons[1].classList.add("active");
  }
}

/* ======================
   CLASIFICACIÓN
====================== */

function clasificarNoticia(texto, fuente = "") {
  const t = texto.toLowerCase();

  // 🟣 REDDIT = FORO
  if (fuente.includes("reddit")) {
    return "[FORO]";
  }

  // 🤖 IA
  if (
    t.includes("ai") ||
    t.includes("inteligencia artificial") ||
    t.includes("openai") ||
    t.includes("chatgpt")
  ) {
    return "[IA]";
  }

  // 🧠 MEDIOS
  if (
    t.includes("media") ||
    t.includes("periodismo") ||
    t.includes("news") ||
    t.includes("prensa")
  ) {
    return "[MEDIA]";
  }

  // 💻 TECNOLOGÍA
  if (
    t.includes("tech") ||
    t.includes("software") ||
    t.includes("hardware") ||
    t.includes("gpu") ||
    t.includes("internet")
  ) {
    return "[TECH]";
  }

  return "[INFO]";
}

/* ======================
   RSS
====================== */

let newsList = [];
let index = 0;

async function loadRSS(feedUrl) {
  const proxy = "https://api.allorigins.win/raw?url=" + encodeURIComponent(feedUrl);

  try {
    const res = await fetch(proxy);
    const text = await res.text();

    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "text/xml");

    const items = xml.querySelectorAll("item");

    items.forEach(item => {
      let title = item.querySelector("title")?.textContent;

      if (title) {
        // limpiar títulos raros
        title = title.replace(/\[.*?\]/g, "").trim();

        const tag = clasificarNoticia(title, feedUrl);

        newsList.push(`${tag} ${title}`);
      }
    });

  } catch (e) {
    console.log("RSS error:", feedUrl);
  }
}

/* ======================
   ROTACIÓN NOTICIAS
====================== */

function rotateNews() {
  if (newsList.length === 0) return;

  setInterval(() => {
    document.getElementById("news").textContent =
      ">> " + newsList[index];

    index = (index + 1) % newsList.length;

  }, 6000);
}

/* ======================
   INIT
====================== */

async function init() {
  for (let feed of feeds) {
    await loadRSS(feed);
  }

  console.log("Noticias cargadas:", newsList.length);

  rotateNews();
}

init();
