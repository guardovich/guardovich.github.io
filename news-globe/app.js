const WORKER_URL = "https://TU-WORKER.TUCUENTA.workers.dev";

const countryInput = document.getElementById("country");
const queryInput = document.getElementById("query");
const searchBtn = document.getElementById("searchBtn");
const spinBtn = document.getElementById("spinBtn");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");

const gazetteer = {
  espana: { name: "España", center: [-3.7038, 40.4168], gl: "ES", hl: "es-ES", ceid: "ES:es" },
  españa: { name: "España", center: [-3.7038, 40.4168], gl: "ES", hl: "es-ES", ceid: "ES:es" },
  chile: { name: "Chile", center: [-70.6693, -33.4489], gl: "CL", hl: "es-419", ceid: "CL:es-419" },
  mexico: { name: "México", center: [-99.1332, 19.4326], gl: "MX", hl: "es-419", ceid: "MX:es-419" },
  méxico: { name: "México", center: [-99.1332, 19.4326], gl: "MX", hl: "es-419", ceid: "MX:es-419" },
  argentina: { name: "Argentina", center: [-58.3816, -34.6037], gl: "AR", hl: "es-419", ceid: "AR:es-419" },
  japon: { name: "Japón", center: [139.6917, 35.6895], gl: "JP", hl: "ja", ceid: "JP:ja" },
  japón: { name: "Japón", center: [139.6917, 35.6895], gl: "JP", hl: "ja", ceid: "JP:ja" },
  usa: { name: "United States", center: [-77.0369, 38.9072], gl: "US", hl: "en-US", ceid: "US:en" },
  france: { name: "France", center: [2.3522, 48.8566], gl: "FR", hl: "fr", ceid: "FR:fr" },
  francia: { name: "France", center: [2.3522, 48.8566], gl: "FR", hl: "fr", ceid: "FR:fr" }
};

let spinning = false;
let spinFrame = null;

const map = new maplibregl.Map({
  container: "map",
  style: "https://demotiles.maplibre.org/style.json",
  center: [0, 15],
  zoom: 1.35,
  attributionControl: true
});

map.addControl(new maplibregl.NavigationControl(), "top-right");

map.on("style.load", () => {
  map.setProjection({ type: "globe" });
  map.setFog({
    range: [0.5, 10],
    color: "rgba(20, 35, 70, 0.95)",
    "high-color": "rgba(5, 10, 20, 0.9)",
    "space-color": "rgba(2, 4, 10, 1)",
    "horizon-blend": 0.08
  });
});

function setStatus(text) {
  statusEl.textContent = text;
}

function normalizeKey(value = "") {
  return value.trim().toLowerCase();
}

function renderResults(items = []) {
  resultsEl.innerHTML = "";

  if (!items.length) {
    resultsEl.innerHTML = `<div class="card"><div class="summary">Sin resultados.</div></div>`;
    return;
  }

  for (const item of items) {
    const card = document.createElement("article");
    card.className = "card";

    const title = item.title || "Sin título";
    const link = item.link || "#";
    const source = item.source || "Fuente desconocida";
    const pubDate = item.pubDate || "";
    const summary = item.summary || "";

    card.innerHTML = `
      <h3><a href="${link}" target="_blank" rel="noopener noreferrer">${escapeHtml(title)}</a></h3>
      <div class="meta">${escapeHtml(source)} ${pubDate ? "· " + escapeHtml(pubDate) : ""}</div>
      <div class="summary">${escapeHtml(summary)}</div>
    `;

    resultsEl.appendChild(card);
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

async function searchNews() {
  const rawCountry = countryInput.value.trim();
  const query = queryInput.value.trim();
  const key = normalizeKey(rawCountry);

  if (!rawCountry) {
    setStatus("Escribe un país o zona.");
    return;
  }

  const place = gazetteer[key];
  if (!place) {
    setStatus("País no encontrado en esta versión mínima.");
    return;
  }

  map.flyTo({
    center: place.center,
    zoom: 2.8,
    speed: 0.8
  });

  setStatus(`Buscando noticias para ${place.name}...`);

  const url = new URL(WORKER_URL);
  url.searchParams.set("place", place.name);
  url.searchParams.set("gl", place.gl);
  url.searchParams.set("hl", place.hl);
  url.searchParams.set("ceid", place.ceid);
  if (query) url.searchParams.set("q", query);

  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    renderResults(data.items || []);
    setStatus(`Mostrando ${data.items?.length || 0} noticias de ${place.name}.`);
  } catch (err) {
    console.error(err);
    setStatus("Error cargando noticias.");
    renderResults([]);
  }
}

function startSpin() {
  if (spinning) return;
  spinning = true;
  spinBtn.textContent = "Parar giro";

  const step = () => {
    if (!spinning) return;
    const center = map.getCenter();
    map.easeTo({
      center: [center.lng + 0.08, center.lat],
      duration: 60,
      easing: n => n
    });
    spinFrame = requestAnimationFrame(step);
  };

  spinFrame = requestAnimationFrame(step);
}

function stopSpin() {
  spinning = false;
  spinBtn.textContent = "Girar globo";
  if (spinFrame) cancelAnimationFrame(spinFrame);
}

searchBtn.addEventListener("click", searchNews);

queryInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchNews();
});

countryInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchNews();
});

spinBtn.addEventListener("click", () => {
  if (spinning) stopSpin();
  else startSpin();
});

map.on("click", async (e) => {
  const lng = e.lngLat.lng;
  const lat = e.lngLat.lat;

  setStatus("Detectando zona del clic...");

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=3&accept-language=es`
    );
    const data = await response.json();

    const country =
      data?.address?.country ||
      data?.name ||
      "";

    if (country) {
      countryInput.value = country;
      setStatus(`Zona detectada: ${country}. Pulsa Buscar.`);
    } else {
      setStatus("No pude identificar ese país.");
    }
  } catch (err) {
    console.error(err);
    setStatus("No pude resolver la zona del clic.");
  }
});
