/* ======================
   CONFIG
====================== */

const streams = {
  main: "https://stream.laut.fm/metal",
  clean: "https://ice4.somafm.com/metal-128-mp3"
};

const feeds = [
  "https://feeds.bbci.co.uk/news/technology/rss.xml",
  "https://www.niemanlab.org/feed/",
  "https://www.xataka.com/feed.xml",

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

      status.innerHTML =
        tipo === "main"
          ? '>> <span class="live">LIVE</span> ROCK/METAL'
          : '>> <span class="live">LIVE</span> METAL CLEAN';
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

  document.querySelectorAll(".controls button")
    .forEach(btn => btn.classList.remove("active"));
}

/* ======================
   BOTÓN ACTIVO
====================== */

function setActiveButton(tipo) {
  const buttons = document.querySelectorAll(".controls button");

  buttons.forEach(btn => btn.classList.remove("active"));

  if (tipo === "main") buttons[0].classList.add("active");
  if (tipo === "clean") buttons[1].classList.add("active");
}

/* ======================
   CLASIFICACIÓN
====================== */

function clasificarNoticia(texto, fuente = "") {
  const t = texto.toLowerCase();

  if (fuente.includes("reddit")) return "[FORO]";

  if (
    t.includes("ai") ||
    t.includes("inteligencia artificial") ||
    t.includes("openai") ||
    t.includes("chatgpt")
  ) return "[IA]";

  if (
    t.includes("media") ||
    t.includes("periodismo") ||
    t.includes("news") ||
    t.includes("prensa")
  ) return "[MEDIA]";

  if (
    t.includes("tech") ||
    t.includes("software") ||
    t.includes("hardware") ||
    t.includes("gpu") ||
    t.includes("internet")
  ) return "[TECH]";

  return "[INFO]";
}

/* ======================
   RSS
====================== */

let newsList = [];
let index = 0;

async function loadRSS(feedUrl) {
  const proxy = "https://corsproxy.io/?url=" + encodeURIComponent(feedUrl);

  try {
    const res = await fetch(proxy);
    const text = await res.text();

    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "text/xml");

    // 🔥 compatible RSS + Reddit
    const items = xml.querySelectorAll("item, entry");

    items.forEach((item, i) => {
      if (i > 10) return; // 🔥 límite

      let title = item.querySelector("title")?.textContent;

      if (title) {
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
   ROTACIÓN
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
   INIT (OPTIMIZADO)
====================== */

async function init() {

  status.textContent = ">> CARGANDO NOTICIAS...";

  // ⚡ carga paralela
  await Promise.all(feeds.map(feed => loadRSS(feed)));

  console.log("Noticias cargadas:", newsList.length);

  status.textContent = ">> READY";

  rotateNews();
}

init();
