const weatherData = {
  city: "Santander",
  temperature: "13°C",
  tide: "ALTA 18:42"
};

const newsData = [
  {
    title: "Nuevo tablón ciudadano en formato teletexto para avisos y eventos locales",
    body: "El proyecto apuesta por una interfaz directa, ligera y sin publicidad, pensada para leer de un vistazo en móvil, ordenador o pantalla pública.",
    zone: "Centro",
    time: "08:25"
  },
  {
    title: "La información local breve gana valor frente a interfaces lentas y saturadas",
    body: "El formato de titulares cortos y entradillas rápidas recupera la lógica de servicio público y facilita el acceso inmediato a lo importante.",
    zone: "Santander",
    time: "08:12"
  },
  {
    title: "Vecinos plantean compartir avisos útiles de barrio en un entorno sin registro",
    body: "La idea es mantener un tono comunitario y práctico, centrado en incidencias, actividades, recomendaciones y anuncios con valor ciudadano.",
    zone: "Castilla-Hermida",
    time: "07:50"
  },
  {
    title: "Pequeños comercios y bares podrían usar el panel como display informativo",
    body: "La estética teletexto permite mostrar titulares destacados y un teletipo continuo en pantallas visibles desde la barra o el escaparate.",
    zone: "Puertochico",
    time: "07:32"
  },
  {
    title: "Se estudia integrar temperatura, viento y mareas en la cabecera del portal",
    body: "La combinación de información útil y diseño retro convierte la portada en una herramienta rápida para el día a día en la ciudad.",
    zone: "Bahía",
    time: "07:10"
  }
];

const commentsData = [
  {
    author: "Anónimo 01",
    body: "Muy buena idea lo de reunir avisos locales sin popups ni ruido."
  },
  {
    author: "Anónimo 02",
    body: "Este formato en una tele de bar puede quedar espectacular."
  },
  {
    author: "Anónimo 03",
    body: "Añadir viento, mareas y temperatura le da un punto muy útil."
  },
  {
    author: "Anónimo 04",
    body: "Se lee rápido y la columna lateral le da bastante vida."
  }
];

function setStatusData() {
  const tempEl = document.getElementById("temp-value");
  const tideEl = document.getElementById("tide-value");

  if (tempEl) tempEl.textContent = weatherData.temperature;
  if (tideEl) tideEl.textContent = weatherData.tide;
}

function renderFeaturedNews(items) {
  const container = document.getElementById("featured-news");
  if (!container) return;

  const featured = items.slice(0, 2);

  container.innerHTML = featured.map((item, index) => {
    const secondaryClass = index === 1 ? "secondary" : "";
    const metaColor = index === 0 ? "c-cyan" : "c-yellow";

    return `
      <article class="featured-card ${secondaryClass}">
        <div class="featured-meta ${metaColor}">
          ${item.zone} · ${item.time}
        </div>
        <h2 class="featured-title">${item.title}</h2>
        <p class="featured-body">${item.body}</p>
      </article>
    `;
  }).join("");
}

function renderNewsList(items) {
  const container = document.getElementById("news-list");
  if (!container) return;

  const rest = items.slice(2);

  container.innerHTML = rest.map(item => `
    <article class="news-item">
      <div class="news-head">
        <h3 class="news-title">${item.title}</h3>
        <div class="news-time">${item.zone} · ${item.time}</div>
      </div>
      <p class="news-body">${item.body}</p>
    </article>
  `).join("");
}

function renderComments(items) {
  const container = document.getElementById("comments-list");
  if (!container) return;

  container.innerHTML = items.map(item => `
    <article class="comment-item">
      <div class="comment-author">${item.author}</div>
      <p class="comment-body">${item.body}</p>
    </article>
  `).join("");
}

function buildTicker(items) {
  const track = document.getElementById("ticker-track");
  if (!track) return;

  const text = items
    .map(item => `${item.title.toUpperCase()}`)
    .join("  ·  ");

  track.textContent = `${text}  ·  ${text}  ·  `;
}

function init() {
  setStatusData();
  renderFeaturedNews(newsData);
  renderNewsList(newsData);
  renderComments(commentsData);
  buildTicker(newsData);
}

document.addEventListener("DOMContentLoaded", init);
