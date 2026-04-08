const geoBtn = document.getElementById("geoBtn");
const WORKER_URL = "https://news-globe-worker.davidguardopuertas.workers.dev";

const countryInput = document.getElementById("country");
const queryInput = document.getElementById("query");
const searchBtn = document.getElementById("searchBtn");
const spinBtn = document.getElementById("spinBtn");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");

const gazetteer = {
  espana: { name: "España", center: [-3.7038, 40.4168], gl: "ES", hl: "es-ES", ceid: "ES:es" },
  españa: { name: "España", center: [-3.7038, 40.4168], gl: "ES", hl: "es-ES", ceid: "ES:es" },
  spain: { name: "España", center: [-3.7038, 40.4168], gl: "ES", hl: "es-ES", ceid: "ES:es" },

  portugal: { name: "Portugal", center: [-9.1393, 38.7223], gl: "PT", hl: "pt-PT", ceid: "PT:pt-150" },

  chile: { name: "Chile", center: [-70.6693, -33.4489], gl: "CL", hl: "es-419", ceid: "CL:es-419" },

  mexico: { name: "México", center: [-99.1332, 19.4326], gl: "MX", hl: "es-419", ceid: "MX:es-419" },
  méxico: { name: "México", center: [-99.1332, 19.4326], gl: "MX", hl: "es-419", ceid: "MX:es-419" },

  argentina: { name: "Argentina", center: [-58.3816, -34.6037], gl: "AR", hl: "es-419", ceid: "AR:es-419" },

  colombia: { name: "Colombia", center: [-74.0721, 4.711], gl: "CO", hl: "es-419", ceid: "CO:es-419" },

  peru: { name: "Perú", center: [-77.0428, -12.0464], gl: "PE", hl: "es-419", ceid: "PE:es-419" },
  perú: { name: "Perú", center: [-77.0428, -12.0464], gl: "PE", hl: "es-419", ceid: "PE:es-419" },

  brasil: { name: "Brasil", center: [-47.8825, -15.7942], gl: "BR", hl: "pt-BR", ceid: "BR:pt-419" },
  brazil: { name: "Brasil", center: [-47.8825, -15.7942], gl: "BR", hl: "pt-BR", ceid: "BR:pt-419" },

  "reino unido": { name: "United Kingdom", center: [-0.1276, 51.5072], gl: "GB", hl: "en-GB", ceid: "GB:en" },
  "united kingdom": { name: "United Kingdom", center: [-0.1276, 51.5072], gl: "GB", hl: "en-GB", ceid: "GB:en" },
  uk: { name: "United Kingdom", center: [-0.1276, 51.5072], gl: "GB", hl: "en-GB", ceid: "GB:en" },

  alemania: { name: "Deutschland", center: [13.405, 52.52], gl: "DE", hl: "de", ceid: "DE:de" },
  germany: { name: "Deutschland", center: [13.405, 52.52], gl: "DE", hl: "de", ceid: "DE:de" },
  deutschland: { name: "Deutschland", center: [13.405, 52.52], gl: "DE", hl: "de", ceid: "DE:de" },

  italia: { name: "Italia", center: [12.4964, 41.9028], gl: "IT", hl: "it", ceid: "IT:it" },
  italy: { name: "Italia", center: [12.4964, 41.9028], gl: "IT", hl: "it", ceid: "IT:it" },

  france: { name: "France", center: [2.3522, 48.8566], gl: "FR", hl: "fr", ceid: "FR:fr" },
  francia: { name: "France", center: [2.3522, 48.8566], gl: "FR", hl: "fr", ceid: "FR:fr" },

  belgica: { name: "Belgique", center: [4.3517, 50.8503], gl: "BE", hl: "fr", ceid: "BE:fr" },
  bélgica: { name: "Belgique", center: [4.3517, 50.8503], gl: "BE", hl: "fr", ceid: "BE:fr" },
  belgium: { name: "Belgique", center: [4.3517, 50.8503], gl: "BE", hl: "fr", ceid: "BE:fr" },

  "paises bajos": { name: "Nederland", center: [4.9041, 52.3676], gl: "NL", hl: "nl", ceid: "NL:nl" },
  "países bajos": { name: "Nederland", center: [4.9041, 52.3676], gl: "NL", hl: "nl", ceid: "NL:nl" },
  netherlands: { name: "Nederland", center: [4.9041, 52.3676], gl: "NL", hl: "nl", ceid: "NL:nl" },
  holland: { name: "Nederland", center: [4.9041, 52.3676], gl: "NL", hl: "nl", ceid: "NL:nl" },

  japon: { name: "Japón", center: [139.6917, 35.6895], gl: "JP", hl: "ja", ceid: "JP:ja" },
  japón: { name: "Japón", center: [139.6917, 35.6895], gl: "JP", hl: "ja", ceid: "JP:ja" },
  japan: { name: "Japón", center: [139.6917, 35.6895], gl: "JP", hl: "ja", ceid: "JP:ja" },

  china: { name: "China", center: [116.4074, 39.9042], gl: "CN", hl: "zh-CN", ceid: "CN:zh-Hans" },

  india: { name: "India", center: [77.209, 28.6139], gl: "IN", hl: "en-IN", ceid: "IN:en" },

  australia: { name: "Australia", center: [151.2093, -33.8688], gl: "AU", hl: "en-AU", ceid: "AU:en" },

  canada: { name: "Canada", center: [-75.6972, 45.4215], gl: "CA", hl: "en-CA", ceid: "CA:en" },

  usa: { name: "United States", center: [-77.0369, 38.9072], gl: "US", hl: "en-US", ceid: "US:en" },
  eeuu: { name: "United States", center: [-77.0369, 38.9072], gl: "US", hl: "en-US", ceid: "US:en" },
  "estados unidos": { name: "United States", center: [-77.0369, 38.9072], gl: "US", hl: "en-US", ceid: "US:en" },
  "united states": { name: "United States", center: [-77.0369, 38.9072], gl: "US", hl: "en-US", ceid: "US:en" },

  rusia: { name: "Russia", center: [37.6173, 55.7558], gl: "RU", hl: "ru", ceid: "RU:ru" },
  russia: { name: "Russia", center: [37.6173, 55.7558], gl: "RU", hl: "ru", ceid: "RU:ru" },

  turquia: { name: "Türkiye", center: [32.8597, 39.9334], gl: "TR", hl: "tr", ceid: "TR:tr" },
  turquía: { name: "Türkiye", center: [32.8597, 39.9334], gl: "TR", hl: "tr", ceid: "TR:tr" },
  turkey: { name: "Türkiye", center: [32.8597, 39.9334], gl: "TR", hl: "tr", ceid: "TR:tr" }
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
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
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
      <div class="meta">${escapeHtml(source)}${pubDate ? " · " + escapeHtml(pubDate) : ""}</div>
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
    renderResults([]);
    return;
  }

  const place = gazetteer[key];
  if (!place) {
    setStatus("País no encontrado todavía. Prueba con España, Francia, Japón, USA, Alemania, Italia, Portugal, México...");
    renderResults([]);
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

  if (query) {
    url.searchParams.set("q", query);
  }

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    console.log("Respuesta Worker:", data);

    if (!data.ok) {
      setStatus("El Worker devolvió error.");
      renderResults([]);
      return;
    }

    renderResults(data.items || []);

    if (!data.items || data.items.length === 0) {
      setStatus(`No llegaron noticias para ${place.name}. Prueba otro país o cambia el tema.`);
      return;
    }

    setStatus(`Mostrando ${data.items.length} noticias de ${place.name}.`);
  } catch (err) {
    console.error(err);
    setStatus(`Error cargando noticias: ${err.message}`);
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
      easing: (n) => n
    });

    spinFrame = requestAnimationFrame(step);
  };

  spinFrame = requestAnimationFrame(step);
}

function stopSpin() {
  spinning = false;
  spinBtn.textContent = "Girar globo";

  if (spinFrame) {
    cancelAnimationFrame(spinFrame);
    spinFrame = null;
  }
}

searchBtn.addEventListener("click", searchNews);

queryInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchNews();
  }
});

countryInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchNews();
  }
});

spinBtn.addEventListener("click", () => {
  if (spinning) {
    stopSpin();
  } else {
    startSpin();
  }
});

map.on("click", async (e) => {
  const lng = e.lngLat.lng;
  const lat = e.lngLat.lat;

  setStatus("Detectando zona del clic...");

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=3&accept-language=es`,
      { cache: "no-store" }
    );

    const data = await response.json();

    const country = data?.address?.country || data?.name || "";

    if (country) {
      countryInput.value = country;
      setStatus(`Zona detectada: ${country}.`);
    } else {
      setStatus("No pude identificar ese país.");
    }
  } catch (err) {
    console.error(err);
    setStatus("No pude resolver la zona del clic.");
  }
});

geoBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    setStatus("Geolocalización no soportada.");
    return;
  }

  setStatus("Obteniendo tu ubicación...");

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=3&accept-language=es`,
          { cache: "no-store" }
        );

        const data = await response.json();
        const country = data?.address?.country || data?.name || "";

        if (country) {
          countryInput.value = country;
          setStatus(`Ubicación detectada: ${country}.`);
        } else {
          setStatus("No pude detectar tu país.");
        }
      } catch (err) {
        console.error(err);
        setStatus("Error obteniendo ubicación.");
      }
    },
    (error) => {
      console.error(error);
      setStatus("Permiso de ubicación denegado o no disponible.");
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
});
