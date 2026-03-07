const weatherData = {
  city: "Santander",
  temperature: "13°C",
  tide: "ALTA 18:42"
};

let rotatingIndex = 0;
let rotatingInterval = null;
let moderatorMode = false;

function setStatusData() {
  const tempEl = document.getElementById("temp-value");
  const tideEl = document.getElementById("tide-value");

  if (tempEl) tempEl.textContent = weatherData.temperature;
  if (tideEl) tideEl.textContent = weatherData.tide;
}

async function refreshStatusData() {
  try {
    // De momento usa datos locales.
    // Aquí luego puedes meter una API real de tiempo y mareas.
    setStatusData();
    console.log("Estado actualizado:", new Date().toLocaleString("es-ES"));
  } catch (error) {
    console.error("Error actualizando tiempo y mareas:", error);
  }
}

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

function updateClock() {
  const clockEl = document.getElementById("clock-box");
  const dateEl = document.getElementById("date-box");
  const now = new Date();

  if (clockEl) {
    clockEl.textContent = now.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).toUpperCase();
  }
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
        <p class="featured-body">Aún no hay publicaciones aprobadas en la base de datos.</p>
      </article>
    `;
    return;
  }

  const featured = items.slice(0, 2);

  container.innerHTML = featured.map((item, index) => `
    <article class="featured-card ${index === 1 ? "secondary" : ""}">
      <div class="featured-meta ${index === 0 ? "c-cyan" : "c-yellow"}">
        ${escapeHtml(item.zone || "Santander")} · ${formatTime(item.created_at)}
      </div>
      <h2 class="featured-title">${escapeHtml(item.title || "")}</h2>
      <p class="featured-body">${escapeHtml(item.body || "")}</p>
      ${moderatorMode ? `<button class="moderate-button" onclick="hideNews(${item.id})">[mod]</button>` : ""}
    </article>
  `).join("");
}

function renderNewsList(items) {
  const container = document.getElementById("news-list");
  if (!container) return;

  const rest = items.slice(2);

  if (!rest.length) {
    container.innerHTML = `
      <div class="empty-box">NO HAY MÁS TITULARES DISPONIBLES</div>
    `;
    return;
  }

  container.innerHTML = rest.map(item => `
    <article class="news-item">
      <div class="news-head">
        <h3 class="news-title">${escapeHtml(item.title || "")}</h3>
        <div class="news-time">${escapeHtml(item.zone || "Santander")} · ${formatTime(item.created_at)}</div>
      </div>
      <p class="news-body">${escapeHtml(item.body || "")}</p>
      ${moderatorMode ? `<button class="moderate-button" onclick="hideNews(${item.id})">[mod]</button>` : ""}
    </article>
  `).join("");
}

function renderComments(items) {
  const container = document.getElementById("comments-list");
  if (!container) return;

  if (!items.length) {
    container.innerHTML = `
      <div class="empty-box">SIN COMENTARIOS TODAVÍA</div>
    `;
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
    track.textContent = "SIN TITULARES DISPONIBLES · SIN TITULARES DISPONIBLES · ";
    return;
  }

  const text = items.map(item => (item.title || "").toUpperCase()).join("  ·  ");
  track.textContent = `${text}  ·  ${text}  ·  `;
}

function renderRotatingHeadline(items) {
  const el = document.getElementById("rotating-headline");
  if (!el) return;

  if (!items.length) {
    el.textContent = "SIN TITULARES DISPONIBLES";
    return;
  }

  const item = items[rotatingIndex % items.length];
  el.textContent = `${item.title} · ${item.zone || "Santander"} · ${formatTime(item.created_at)}`;
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

async function loadNews() {
  const { data, error } = await supabaseClient
    .from("posts")
    .select("id, title, body, zone, created_at")
    .eq("kind", "news")
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    console.error("Error cargando noticias:", error);
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
    console.error("Error cargando comentarios:", error);
    return [];
  }

  return data || [];
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

function injectModeratorAccess() {
  const footer = document.querySelector(".ttx-footer");
  if (!footer) return;

  const modControl = document.createElement("span");
  modControl.className = "footer-item footer-mod";
  modControl.style.cursor = "pointer";

  if (moderatorMode) {
    modControl.innerHTML = `<span class="c-red">999</span> MOD ON`;
    modControl.onclick = deactivateModeratorMode;
    modControl.title = "Desactivar modo moderador";
  } else {
    modControl.innerHTML = `<span class="c-red">999</span> MOD`;
    modControl.onclick = activateModeratorMode;
    modControl.title = "Activar modo moderador";
  }

  footer.appendChild(modControl);
}

async function init() {
  restoreModeratorMode();

  setStatusData();
  await refreshStatusData();

  updateClock();
  setInterval(updateClock, 1000);

  // Actualiza temperatura y mareas cada hora
  setInterval(refreshStatusData, 60 * 60 * 1000);

  await ensureSession();

  const [news, comments] = await Promise.all([
    loadNews(),
    loadComments()
  ]);

  renderFeaturedNews(news);
  renderNewsList(news);
  renderComments(comments);
  buildTicker(news);
  startRotatingHeadlines(news);
  injectModeratorAccess();
}

document.addEventListener("DOMContentLoaded", init);
