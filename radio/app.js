/* ======================
   CONFIG
====================== */

const STREAM_URL = "https://stream.laut.fm/metal";

const feeds = [
  "https://feeds.bbci.co.uk/news/technology/rss.xml",
  "https://www.niemanlab.org/feed/",
  "https://www.xataka.com/feed.xml"
];

/* ======================
   AUDIO
====================== */

const audio = document.getElementById("audio");
const status = document.getElementById("status");

function play() {
  audio.src = STREAM_URL;

  audio.play()
    .then(() => {
      status.innerHTML = '>> <span class="live">LIVE</span> METAL STREAM';
    })
    .catch(err => {
      status.textContent = ">> ERROR PLAY";
      console.error(err);
    });
}

function stop() {
  audio.pause();
  audio.src = "";
  status.textContent = ">> STOPPED";
}

/* ======================
   CLASIFICACIÓN
====================== */

function clasificarNoticia(texto) {
  const t = texto.toLowerCase();

  // IA
  if (t.includes("ai") || t.includes("inteligencia artificial") || t.includes("openai") || t.includes("chatgpt")) {
    return "[IA]";
  }

  // MEDIOS / COMUNICACIÓN
  if (t.includes("media") || t.includes("periodismo") || t.includes("news") || t.includes("prensa")) {
    return "[MEDIA]";
  }

  // TECNOLOGÍA
  if (t.includes("tech") || t.includes("software") || t.includes("hardware") || t.includes("gpu") || t.includes("internet")) {
    return "[TECH]";
  }

  // DEFAULT
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
      const title = item.querySelector("title")?.textContent;
      if (title) {
        const tag = clasificarNoticia(title);
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
   INIT
====================== */

async function init() {
  for (let feed of feeds) {
    await loadRSS(feed);
  }
  rotateNews();
}

init();
