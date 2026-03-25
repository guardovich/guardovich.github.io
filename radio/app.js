/* ======================
   CONFIG
====================== */

const STREAM_URL = "https://TU-STREAM-AQUI";

const feeds = [
  "https://rss.elpais.com/rss/elpais/tecnologia.xml",
  "https://feeds.bbci.co.uk/news/technology/rss.xml"
];

/* ======================
   AUDIO
====================== */

const audio = document.getElementById("audio");
const status = document.getElementById("status");

function play() {
  audio.src = STREAM_URL;
  audio.play();

  status.innerHTML = '>> <span class="live">LIVE</span> METAL STREAM';

  activarSinei();
}

function stop() {
  audio.pause();
  audio.src = "";

  status.textContent = ">> STOPPED";
}

/* ======================
   VOZ SINEI
====================== */

const frases = [
  "El medio es el mensaje",
  "La información no es neutra",
  "El encuadre define la realidad",
  "La esfera pública está distorsionada",
  "Detectando sesgo mediático",
  "La tecnología moldea la percepción",
  "Lo que se omite también comunica",
  "Analizando rigor periodístico"
];

function hablar(texto) {
  const msg = new SpeechSynthesisUtterance(texto);
  msg.lang = "es-ES";
  msg.rate = 0.9;
  msg.pitch = 0.8;

  speechSynthesis.speak(msg);
}

function activarSinei() {
  setInterval(() => {
    const frase = frases[Math.floor(Math.random() * frases.length)];
    hablar(frase);
  }, 25000);
}

/* ======================
   RSS
====================== */

let newsList = [];
let index = 0;

async function loadAllFeeds() {
  for (let feed of feeds) {
    await loadRSS(feed);
  }
  rotateNews();
}

async function loadRSS(feedUrl) {
  const proxy = "https://api.allorigins.win/get?url=" + encodeURIComponent(feedUrl);

  try {
    const res = await fetch(proxy);
    const data = await res.json();

    const parser = new DOMParser();
    const xml = parser.parseFromString(data.contents, "text/xml");

    const items = xml.querySelectorAll("item");

    items.forEach(item => {
      const title = item.querySelector("title")?.textContent;
      if (title) newsList.push(title);
    });

  } catch (e) {
    console.log("RSS error");
  }
}

/* ======================
   ROTACIÓN NOTICIAS
====================== */

function rotateNews() {
  if (newsList.length === 0) return;

  setInterval(() => {
    const news = document.getElementById("news");

    news.textContent = ">> " + newsList[index];

    // voz opcional
    hablar("Nuevo titular detectado");

    index = (index + 1) % newsList.length;

  }, 8000);
}

/* ======================
   INIT
====================== */

loadAllFeeds();
