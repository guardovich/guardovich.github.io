let rotatingIndex = 0;
let rotatingInterval = null;
let moderatorMode = false;

let newsPages = [];
let currentNewsPage = 0;
let newsPageInterval = null;

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatTime(value) {
  if (!value) return "--:--";
  return new Date(value).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function stripHtml(str = "") {
  return String(str).replace(/<[^>]*>/g, "").trim();
}

function extractSource(item) {
  if (item.author) return stripHtml(item.author).toUpperCase();

  const title = stripHtml(item.title || "");
  const parts = title.split(" - ");

  if (parts.length > 1) {
    return parts[parts.length - 1].toUpperCase();
  }

  return "MEDIO";
}

function cleanTitle(item) {
  const title = stripHtml(item.title || "");
  const parts = title.split(" - ");

  if (parts.length > 1) {
    parts.pop();
    return parts.join(" - ").trim();
  }

  return title;
}

function activateModeratorMode() {
  const password = prompt("Clave de moderador");

  if (password === "racing123") {
    sessionStorage.setItem("moderatorMode", "true");
    alert("Modo moderador activado");
    location.reload();
  } else {
    alert("Clave incorrecta");
  }
}

function restoreModeratorMode() {
  moderatorMode = sessionStorage.getItem("moderatorMode") === "true";
}

function deactivateModeratorMode() {
  sessionStorage.removeItem("moderatorMode");
  moderatorMode = false;
  location.reload();
}

function renderFeaturedNews(items) {
  const container = document.getElementById("featured-news");
  if (!container) return;

  if (!items.length) {
    container.innerHTML = `
      <article class="featured-card">
        <div class="featured-meta c-cyan">SANTANDER · --:--</div>
        <h2 class="featured-title">SIN NOTICIAS TODAVÍA</h2>
        <p class="featured-body">Aún no hay publicaciones aprobadas.</p>
      </article>
    `;
    return;
  }

  const featured = items.slice(0, 2);

  container.innerHTML = featured.map((item, index) => `
    <article class="featured-card ${index === 1 ? "secondary" : ""}">
      <div class="featured-meta ${index === 0 ? "c-cyan" : "c-yellow"}">
        ${escapeHtml(item.zone || item.source || "Santander")} · ${formatTime(item.created_at)}
      </div>
      <h2 class="featured-title">${escapeHtml(item.title || "")}</h2>
      <p class="featured-body">${escapeHtml(item.body || "")}</p>
      ${moderatorMode && item.id ? `<button class="moderate-button" onclick="hideNews(${item.id})">[mod]</button>` : ""}
    </article>
  `).join("");
}

function renderNewsList(items) {
  const container = document.getElementById("news-list");
  if (!container) return;

  const rest = items.slice(2);

  if (!rest.length) {
    container.innerHTML = `<div class="empty-box">NO HAY MÁS TITULARES</div>`;
    return;
  }

  container.innerHTML = rest.map(item => `
    <article class="news-item">
      <div class="news-head">
        <h3 class="news-title">${escapeHtml(item.title || "")}</h3>
        <div class="news-time">
          ${escapeHtml(item.zone || "Santander")} · ${formatTime(item.created_at)}
        </div>
      </div>
      <p class="news-body">${escapeHtml(item.body || "")}</p>
      ${moderatorMode && item.id ? `<button class="moderate-button" onclick="hideNews(${item.id})">[mod]</button>` : ""}
    </article>
  `).join("");
}

function renderMediaNews(items) {
  const container = document.getElementById("media-news-list");
  if (!container) return;

  if (!items.length) {
    container.innerHTML = `<div class="empty-box">SIN INFORMACIÓN DE MEDIOS</div>`;
    return;
  }

  container.innerHTML = items.map(item => `
    <article class="news-item media-news-item">
      <div class="news-head">
        <h3 class="news-title">
          <a href="${item.link}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title || "")}</a>
        </h3>
        <div class="news-time">
          ${escapeHtml(item.source || "MEDIO")} · ${formatTime(item.created_at)}
        </div>
      </div>
      <p class="news-body">${escapeHtml(item.body || "")}</p>
    </article>
  `).join("");
}

function renderComments(items) {
  const container = document.getElementById("comments-list");
  if (!container) return;

  if (!items.length) {
    container.innerHTML = `<div class="empty-box">SIN COMENTARIOS TODAVÍA</div>`;
    return;
  }

  container.innerHTML = items.map(item => `
    <article class="comment-item">
      <div class="comment-author">${escapeHtml(item.author_name || "Anónimo")}</div>
      <p class="comment-body">${escapeHtml(item.body || "")}</p>
      ${moderatorMode ? `<button class="moderate-button" onclick="hideComment(${item.id})">[mod]</button>` : ""}
    </article>
  `).join("");
}

function buildTicker(items) {
  const track = document.getElementById("ticker-track");
  if (!track) return;

  if (!items.length) {
    track.textContent = "SIN TITULARES DISPONIBLES · ";
    return;
  }

  const text = items
    .map(item => (item.title || "").toUpperCase())
    .filter(Boolean)
    .join(" · ");

  track.textContent = `${text} · ${text} · `;
}

function renderRotatingHeadline(items) {
  const el = document.getElementById("rotating-headline");
  if (!el) return;

  if (!items.length) {
    el.textContent = "SIN TITULARES DISPONIBLES";
    return;
  }

  const item = items[rotatingIndex % items.length];
  el.textContent = `${item.title} · ${(item.zone || item.source || "Santander")} · ${formatTime(item.created_at)}`;
}

function startRotatingHeadlines(items) {
  if (rotatingInterval) clearInterval(rotatingInterval);

  renderRotatingHeadline(items);

  if (!items.length) return;

  rotatingInterval = setInterval(() => {
    rotatingIndex = (rotatingIndex + 1) % items.length;
    renderRotatingHeadline(items);
  }, 3500);
}

function splitIntoPages(items, pageSize = 6) {
  const pages = [];

  for (let i = 0; i < items.length; i += pageSize) {
    pages.push(items.slice(i, i + pageSize));
  }

  return pages;
}

function renderNewsPage(pageItems) {
  renderFeaturedNews(pageItems);
  renderNewsList(pageItems);
}

function startNewsPageRotation(allNews) {
  if (newsPageInterval) clearInterval(newsPageInterval);

  newsPages = splitIntoPages(allNews, 4);
  currentNewsPage = 0;

  if (!newsPages.length) {
    renderNewsPage([]);
    return;
  }

  renderNewsPage(newsPages[currentNewsPage]);

  if (newsPages.length === 1) return;

  newsPageInterval = setInterval(() => {
    currentNewsPage = (currentNewsPage + 1) % newsPages.length;
    renderNewsPage(newsPages[currentNewsPage]);
  }, 15000);
}

async function loadNews() {
  const { data, error } = await supabaseClient
    .from("posts")
    .select("id, title, body, zone, created_at")
    .eq("kind", "news")
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(24);

  if (error) {
    console.error("Error noticias:", error);
    return [];
  }

  return data || [];
}

async function loadComments() {
  const { data, error } = await supabaseClient
    .from("posts")
    .select("id, body, author_name, created_at")
    .eq("kind", "comment")
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) {
    console.error("Error comentarios:", error);
    return [];
  }

  return data || [];
}

async function fetchRSS(feedUrl) {
  const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;

  try {
    const res = await fetch(api);
    const data = await res.json();

    if (!data || data.status !== "ok" || !Array.isArray(data.items)) {
      console.error("RSS respuesta no válida:", data);
      return [];
    }

    return data.items.map(item => ({
      title: cleanTitle(item),
      body: stripHtml(item.description || "").slice(0, 180),
      source: extractSource(item),
      created_at: item.pubDate,
      link: item.link
    }));
  } catch (e) {
    console.error("RSS error", e);
    return [];
  }
}

async function loadMediaNews() {
  const feeds = [
    "https://news.google.com/rss/search?q=Santander&hl=es&gl=ES&ceid=ES:es",
    "https://news.google.com/rss/search?q=Racing+de+Santander&hl=es&gl=ES&ceid=ES:es"
  ];

  const results = await Promise.all(feeds.map(fetchRSS));

  return results
    .flat()
    .filter(item => item.title && item.link)
    .slice(0, 8);
}

async function hideComment(id) {
  const password = prompt("Clave de moderador");

  if (password !== "racing123") {
    alert("Clave incorrecta");
    return;
  }

  await ensureSession();

  const { error } = await supabaseClient
    .from("posts")
    .update({ approved: false })
    .eq("id", id)
    .eq("kind", "comment");

  if (error) {
    console.error("Error ocultando comentario:", error);
    alert("No se pudo ocultar el comentario");
    return;
  }

  location.reload();
}

async function hideNews(id) {
  const password = prompt("Clave de moderador");

  if (password !== "racing123") {
    alert("Clave incorrecta");
    return;
  }

  await ensureSession();

  const { error } = await supabaseClient
    .from("posts")
    .update({ approved: false })
    .eq("id", id)
    .eq("kind", "news");

  if (error) {
    console.error("Error ocultando noticia:", error);
    alert("No se pudo ocultar la noticia");
    return;
  }

  location.reload();
}

async function init() {
  restoreModeratorMode();

  await ensureSession();

  const [news, comments, mediaNews] = await Promise.all([
    loadNews(),
    loadComments(),
    loadMediaNews()
  ]);

  startNewsPageRotation(news);
  renderComments(comments);
  renderMediaNews(mediaNews);
  buildTicker([...news, ...mediaNews]);
  startRotatingHeadlines([...news, ...mediaNews]);
}

document.addEventListener("DOMContentLoaded", init);
