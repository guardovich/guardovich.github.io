/* ======================
   CONFIG
====================== */

// 🔥 PRUEBA ESTE STREAM (FUNCIONA)
const STREAM_URL = "https://stream.laut.fm/metal";

// RSS
const feeds = [
  "https://feeds.bbci.co.uk/news/technology/rss.xml"
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
      if (title) newsList.push(title);
    });

  } catch (e) {
    console.log("RSS error");
  }
}

function rotateNews() {
  if (newsList.length === 0) return;

  setInterval(() => {
    document.getElementById("news").textContent =
      ">> " + newsList[index];

    index = (index + 1) % newsList.length;
  }, 6000);
}

async function init() {
  for (let feed of feeds) {
    await loadRSS(feed);
  }
  rotateNews();
}

init();
