/* ======================
   CONFIG
====================== */

// 🔥 PON TU STREAM METAL
const STREAM_URL = "https://TU-STREAM-AQUI";

/* RSS */
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

  // efecto visual Sinei activa
  document.querySelector(".avatar img").style.filter =
    "contrast(150%) brightness(140%) hue-rotate(120deg)";
}

function stop() {
  audio.pause();
  audio.src = "";

  status.textContent = ">> STOPPED";

  // vuelve a estado normal
  document.querySelector(".avatar img").style.filter =
    "contrast(120%) brightness(120%) hue-rotate(90deg)";
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
    console.log("RSS error:", feedUrl);
  }
}

/* ======================
   ROTACIÓN
====================== */

function rotateNews() {
  if (newsList.length === 0) return;

  setInterval(() => {
    const news = document.getElementById("news");

    news.classList.remove("scroll");

    setTimeout(() => {
      news.textContent = ">> " + newsList[index];
      news.classList.add("scroll");

      index = (index + 1) % newsList.length;
    }, 100);

  }, 5000);
}

/* ======================
   INIT
====================== */

loadAllFeeds();
