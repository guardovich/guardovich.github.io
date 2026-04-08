const geoBtn = document.getElementById("geoBtn");
const WORKER_URL = "https://news-globe-worker.davidguardopuertas.workers.dev";

const countryInput = document.getElementById("country");
const queryInput = document.getElementById("query");
const searchBtn = document.getElementById("searchBtn");
const spinBtn = document.getElementById("spinBtn");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");

const briefTopicInput = document.getElementById("briefTopic");
const briefCountriesInput = document.getElementById("briefCountries");
const briefBtn = document.getElementById("briefBtn");
const clearBriefBtn = document.getElementById("clearBriefBtn");
const briefStatusEl = document.getElementById("briefStatus");
const briefingResultsEl = document.getElementById("briefingResults");

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
  turkey: { name: "Türkiye", center: [32.8597, 39.9334], gl: "TR", hl: "tr", ceid: "TR:tr" },

  austria: { name: "Österreich", center: [16.3738, 48.2082], gl: "AT", hl: "de", ceid: "AT:de" },
  suiza: { name: "Schweiz", center: [7.4474, 46.948], gl: "CH", hl: "de", ceid: "CH:de" },
  switzerland: { name: "Schweiz", center: [7.4474, 46.948], gl: "CH", hl: "de", ceid: "CH:de" },

  suecia: { name: "Sverige", center: [18.0686, 59.3293], gl: "SE", hl: "sv", ceid: "SE:sv" },
  sweden: { name: "Sverige", center: [18.0686, 59.3293], gl: "SE", hl: "sv", ceid: "SE:sv" },

  noruega: { name: "Norge", center: [10.7522, 59.9139], gl: "NO", hl: "no", ceid: "NO:no" },
  norway: { name: "Norge", center: [10.7522, 59.9139], gl: "NO", hl: "no", ceid: "NO:no" },

  dinamarca: { name: "Danmark", center: [12.5683, 55.6761], gl: "DK", hl: "da", ceid: "DK:da" },
  denmark: { name: "Danmark", center: [12.5683, 55.6761], gl: "DK", hl: "da", ceid: "DK:da" },

  finlandia: { name: "Suomi", center: [24.9384, 60.1699], gl: "FI", hl: "fi", ceid: "FI:fi" },
  finland: { name: "Suomi", center: [24.9384, 60.1699], gl: "FI", hl: "fi", ceid: "FI:fi" },

  polonia: { name: "Polska", center: [21.0122, 52.2297], gl: "PL", hl: "pl", ceid: "PL:pl" },
  poland: { name: "Polska", center: [21.0122, 52.2297], gl: "PL", hl: "pl", ceid: "PL:pl" },

  chequia: { name: "Česko", center: [14.4378, 50.0755], gl: "CZ", hl: "cs", ceid: "CZ:cs" },
  "republica checa": { name: "Česko", center: [14.4378, 50.0755], gl: "CZ", hl: "cs", ceid: "CZ:cs" },
  "república checa": { name: "Česko", center: [14.4378, 50.0755], gl: "CZ", hl: "cs", ceid: "CZ:cs" },
  czechia: { name: "Česko", center: [14.4378, 50.0755], gl: "CZ", hl: "cs", ceid: "CZ:cs" },

  eslovaquia: { name: "Slovensko", center: [17.1077, 48.1486], gl: "SK", hl: "sk", ceid: "SK:sk" },
  slovakia: { name: "Slovensko", center: [17.1077, 48.1486], gl: "SK", hl: "sk", ceid: "SK:sk" },

  hungria: { name: "Magyarország", center: [19.0402, 47.4979], gl: "HU", hl: "hu", ceid: "HU:hu" },
  hungría: { name: "Magyarország", center: [19.0402, 47.4979], gl: "HU", hl: "hu", ceid: "HU:hu" },
  hungary: { name: "Magyarország", center: [19.0402, 47.4979], gl: "HU", hl: "hu", ceid: "HU:hu" },

  rumania: { name: "România", center: [26.1025, 44.4268], gl: "RO", hl: "ro", ceid: "RO:ro" },
  rumanía: { name: "România", center: [26.1025, 44.4268], gl: "RO", hl: "ro", ceid: "RO:ro" },
  romania: { name: "România", center: [26.1025, 44.4268], gl: "RO", hl: "ro", ceid: "RO:ro" },

  bulgaria: { name: "България", center: [23.3219, 42.6977], gl: "BG", hl: "bg", ceid: "BG:bg" },

  grecia: { name: "Ελλάδα", center: [23.7275, 37.9838], gl: "GR", hl: "el", ceid: "GR:el" },
  greece: { name: "Ελλάδα", center: [23.7275, 37.9838], gl: "GR", hl: "el", ceid: "GR:el" },

  irlanda: { name: "Ireland", center: [-6.2603, 53.3498], gl: "IE", hl: "en-IE", ceid: "IE:en" },
  ireland: { name: "Ireland", center: [-6.2603, 53.3498], gl: "IE", hl: "en-IE", ceid: "IE:en" },

  ucrania: { name: "Україна", center: [30.5234, 50.4501], gl: "UA", hl: "uk", ceid: "UA:uk" },
  ukraine: { name: "Україна", center: [30.5234, 50.4501], gl: "UA", hl: "uk", ceid: "UA:uk" },

  israel: { name: "Israel", center: [34.7818, 32.0853], gl: "IL", hl: "he", ceid: "IL:he" },

  egipto: { name: "مصر", center: [31.2357, 30.0444], gl: "EG", hl: "ar", ceid: "EG:ar" },
  egypt: { name: "مصر", center: [31.2357, 30.0444], gl: "EG", hl: "ar", ceid: "EG:ar" },

  sudafrica: { name: "South Africa", center: [28.0473, -26.2041], gl: "ZA", hl: "en-ZA", ceid: "ZA:en" },
  "sudáfrica": { name: "South Africa", center: [28.0473, -26.2041], gl: "ZA", hl: "en-ZA", ceid: "ZA:en" },
  "south africa": { name: "South Africa", center: [28.0473, -26.2041], gl: "ZA", hl: "en-ZA", ceid: "ZA:en" },

  nigeria: { name: "Nigeria", center: [7.3986, 9.0765], gl: "NG", hl: "en-NG", ceid: "NG:en" },

  kenia: { name: "Kenya", center: [36.8219, -1.2921], gl: "KE", hl: "en-KE", ceid: "KE:en" },
  kenya: { name: "Kenya", center: [36.8219, -1.2921], gl: "KE", hl: "en-KE", ceid: "KE:en" },

  marruecos: { name: "المغرب", center: [-6.8498, 34.0209], gl: "MA", hl: "fr", ceid: "MA:fr" },
  morocco: { name: "المغرب", center: [-6.8498, 34.0209], gl: "MA", hl: "fr", ceid: "MA:fr" },

  argelia: { name: "الجزائر", center: [3.0588, 36.7538], gl: "DZ", hl: "fr", ceid: "DZ:fr" },
  algeria: { name: "الجزائر", center: [3.0588, 36.7538], gl: "DZ", hl: "fr", ceid: "DZ:fr" },

  tunez: { name: "تونس", center: [10.1815, 36.8065], gl: "TN", hl: "fr", ceid: "TN:fr" },
  túnez: { name: "تونس", center: [10.1815, 36.8065], gl: "TN", hl: "fr", ceid: "TN:fr" },
  tunisia: { name: "تونس", center: [10.1815, 36.8065], gl: "TN", hl: "fr", ceid: "TN:fr" },

  "arabia saudita": { name: "السعودية", center: [46.6753, 24.7136], gl: "SA", hl: "ar", ceid: "SA:ar" },
  "saudi arabia": { name: "السعودية", center: [46.6753, 24.7136], gl: "SA", hl: "ar", ceid: "SA:ar" },

  "emiratos arabes unidos": { name: "الإمارات", center: [55.2708, 25.2048], gl: "AE", hl: "ar", ceid: "AE:ar" },
  "emiratos árabes unidos": { name: "الإمارات", center: [55.2708, 25.2048], gl: "AE", hl: "ar", ceid: "AE:ar" },
  uae: { name: "الإمارات", center: [55.2708, 25.2048], gl: "AE", hl: "ar", ceid: "AE:ar" },

  qatar: { name: "قطر", center: [51.531, 25.2854], gl: "QA", hl: "ar", ceid: "QA:ar" },
  iran: { name: "Iran", center: [51.389, 35.6892], gl: "IR", hl: "fa", ceid: "IR:fa" },
  pakistan: { name: "Pakistan", center: [73.0479, 33.6844], gl: "PK", hl: "en-PK", ceid: "PK:en" },
  bangladesh: { name: "Bangladesh", center: [90.4125, 23.8103], gl: "BD", hl: "en-BD", ceid: "BD:en" },
  indonesia: { name: "Indonesia", center: [106.8456, -6.2088], gl: "ID", hl: "id", ceid: "ID:id" },

  malasia: { name: "Malaysia", center: [101.6869, 3.139], gl: "MY", hl: "en-MY", ceid: "MY:en" },
  malaysia: { name: "Malaysia", center: [101.6869, 3.139], gl: "MY", hl: "en-MY", ceid: "MY:en" },

  singapur: { name: "Singapore", center: [103.8198, 1.3521], gl: "SG", hl: "en-SG", ceid: "SG:en" },
  singapore: { name: "Singapore", center: [103.8198, 1.3521], gl: "SG", hl: "en-SG", ceid: "SG:en" },

  "corea del sur": { name: "대한민국", center: [126.978, 37.5665], gl: "KR", hl: "ko", ceid: "KR:ko" },
  "south korea": { name: "대한민국", center: [126.978, 37.5665], gl: "KR", hl: "ko", ceid: "KR:ko" },

  tailandia: { name: "ไทย", center: [100.5018, 13.7563], gl: "TH", hl: "th", ceid: "TH:th" },
  thailand: { name: "ไทย", center: [100.5018, 13.7563], gl: "TH", hl: "th", ceid: "TH:th" },

  vietnam: { name: "Việt Nam", center: [105.8342, 21.0278], gl: "VN", hl: "vi", ceid: "VN:vi" },

  filipinas: { name: "Philippines", center: [120.9842, 14.5995], gl: "PH", hl: "en-PH", ceid: "PH:en" },
  philippines: { name: "Philippines", center: [120.9842, 14.5995], gl: "PH", hl: "en-PH", ceid: "PH:en" },

  "nueva zelanda": { name: "New Zealand", center: [174.7762, -41.2866], gl: "NZ", hl: "en-NZ", ceid: "NZ:en" },
  "new zealand": { name: "New Zealand", center: [174.7762, -41.2866], gl: "NZ", hl: "en-NZ", ceid: "NZ:en" },

  "mexico city": { name: "México", center: [-99.1332, 19.4326], gl: "MX", hl: "es-419", ceid: "MX:es-419" }
};

let spinning = false;
let spinFrame = null;
let activeMarkers = [];

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

function setBriefStatus(text) {
  briefStatusEl.textContent = text;
}

function normalizeKey(value = "") {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function clearMapMarkers() {
  activeMarkers.forEach((marker) => marker.remove());
  activeMarkers = [];
}

function addCountryMarker(place, itemCount = 0, topic = "") {
  if (!place || !place.center) return;

  const el = document.createElement("div");
  el.className = "news-marker";

  const size = itemCount >= 10 ? 22 : itemCount >= 5 ? 18 : 14;
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.borderRadius = "50%";
  el.style.background = "rgba(59,130,246,0.9)";
  el.style.border = "2px solid rgba(255,255,255,0.95)";
  el.style.boxShadow = "0 0 0 6px rgba(59,130,246,0.18), 0 0 18px rgba(59,130,246,0.65)";
  el.style.cursor = "pointer";

  const popupHtml = `
    <div style="min-width:180px;">
      <strong>${escapeHtml(place.name)}</strong><br>
      ${topic ? `<span style="color:#444;">Tema: ${escapeHtml(topic)}</span><br>` : ""}
      <span style="color:#444;">Titulares: ${itemCount}</span>
    </div>
  `;

  const marker = new maplibregl.Marker({ element: el })
    .setLngLat(place.center)
    .setPopup(new maplibregl.Popup({ offset: 18 }).setHTML(popupHtml))
    .addTo(map);

  activeMarkers.push(marker);
}

function fitMapToPlaces(places = []) {
  const validPlaces = places.filter((place) => place && Array.isArray(place.center));
  if (!validPlaces.length) return;

  if (validPlaces.length === 1) {
    map.flyTo({
      center: validPlaces[0].center,
      zoom: 2.8,
      speed: 0.8
    });
    return;
  }

  const bounds = new maplibregl.LngLatBounds();
  validPlaces.forEach((place) => bounds.extend(place.center));

  map.fitBounds(bounds, {
    padding: 80,
    duration: 1200,
    maxZoom: 3.5
  });
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

function renderBriefing(groups = [], summaryText = "") {
  briefingResultsEl.innerHTML = "";

  if (!groups.length) {
    briefingResultsEl.innerHTML = `<div class="card"><div class="summary">Todavía no se ha generado ningún briefing.</div></div>`;
    return;
  }

  if (summaryText) {
    const summaryCard = document.createElement("article");
    summaryCard.className = "card";
    summaryCard.innerHTML = `
      <h3>🌐 Resumen geopolítico</h3>
      <div class="summary">${escapeHtml(summaryText)}</div>
    `;
    briefingResultsEl.appendChild(summaryCard);
  }

  groups.forEach((group) => {
    const card = document.createElement("article");
    card.className = "card";

    const itemsHtml = group.items
      .slice(0, 5)
      .map((item) => {
        const title = item.title || "Sin título";
        const link = item.link || "#";
        const source = item.source || "Google News";
        return `
          <div class="brief-item">
            <a href="${link}" target="_blank" rel="noopener noreferrer">${escapeHtml(title)}</a>
            <div class="meta">${escapeHtml(source)}</div>
          </div>
        `;
      })
      .join("");

    card.innerHTML = `
      <h3>${escapeHtml(group.country)}</h3>
      <div class="summary">${escapeHtml(group.analysis)}</div>
      <div class="brief-list">${itemsHtml || '<div class="summary">Sin titulares suficientes.</div>'}</div>
    `;

    briefingResultsEl.appendChild(card);
  });
}

function inferCountryAnalysis(country, items, topic) {
  if (!items || !items.length) {
    return `No se han encontrado suficientes noticias sobre ${topic} en ${country}.`;
  }

  const joined = items
    .map((item) => `${item.title || ""} ${item.summary || ""}`)
    .join(" ")
    .toLowerCase();

  let angle = "cobertura general y diversa";
  let tone = "enfoque informativo";
  let emphasis = "impacto político y social";

  if (joined.includes("gobierno") || joined.includes("ministerio") || joined.includes("presidente")) {
    angle = "cobertura institucional";
  }

  if (
    joined.includes("econom") ||
    joined.includes("mercado") ||
    joined.includes("empresa") ||
    joined.includes("banco") ||
    joined.includes("industr")
  ) {
    emphasis = "impacto económico";
  }

  if (
    joined.includes("ejército") ||
    joined.includes("defensa") ||
    joined.includes("otan") ||
    joined.includes("misil") ||
    joined.includes("seguridad")
  ) {
    emphasis = "seguridad y estrategia";
    tone = "marco estratégico";
  }

  if (
    joined.includes("ley") ||
    joined.includes("regul") ||
    joined.includes("norma") ||
    joined.includes("ue") ||
    joined.includes("comisión")
  ) {
    angle = "cobertura regulatoria";
  }

  if (
    joined.includes("china") ||
    joined.includes("rusia") ||
    joined.includes("eeuu") ||
    joined.includes("estados unidos") ||
    joined.includes("geopol")
  ) {
    tone = "lectura internacional";
  }

  return `En ${country}, el tema "${topic}" aparece con ${angle}, un ${tone} y énfasis en ${emphasis}.`;
}

function buildGeoPoliticalSummary(topic, groups) {
  const withItems = groups.filter((group) => group.items && group.items.length > 0);

  if (!withItems.length) {
    return `No hay base suficiente para elaborar un resumen geopolítico sobre "${topic}".`;
  }

  const countryNames = withItems.map((group) => group.country).join(", ");
  return `El briefing sobre "${topic}" muestra diferencias claras entre ${countryNames}. La cobertura combina ángulos institucionales, económicos y estratégicos según el país. En conjunto, el tema se presenta como un asunto con dimensión internacional, impacto político y efectos sociales que varían según la agenda mediática nacional.`;
}

async function fetchNewsForPlace(place, query = "") {
  const url = new URL(WORKER_URL);
  url.searchParams.set("place", place.name);
  url.searchParams.set("gl", place.gl);
  url.searchParams.set("hl", place.hl);
  url.searchParams.set("ceid", place.ceid);

  if (query) {
    url.searchParams.set("q", query);
  }

  const res = await fetch(url.toString(), { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();

  if (!data.ok) {
    throw new Error("El Worker devolvió error.");
  }

  return Array.isArray(data.items) ? data.items : [];
}

async function searchNews() {
  const rawCountry = countryInput.value.trim();
  const query = queryInput.value.trim();
  const key = normalizeKey(rawCountry);

  if (!rawCountry) {
    setStatus("Escribe un país o zona.");
    renderResults([]);
    clearMapMarkers();
    return;
  }

  const place = gazetteer[key];
  if (!place) {
    setStatus("País no encontrado todavía. Prueba con España, Francia, Japón, USA, Alemania, Italia, Portugal o México.");
    renderResults([]);
    clearMapMarkers();
    return;
  }

  setStatus(`Buscando noticias para ${place.name}...`);

  try {
    const items = await fetchNewsForPlace(place, query);
    renderResults(items);

    clearMapMarkers();
    addCountryMarker(place, items.length, query || place.name);
    fitMapToPlaces([place]);

    if (!items.length) {
      setStatus(`No llegaron noticias para ${place.name}. Prueba otro país o cambia el tema.`);
      return;
    }

    setStatus(`Mostrando ${items.length} noticias de ${place.name}.`);
  } catch (err) {
    console.error(err);
    setStatus(`Error cargando noticias: ${err.message}`);
    renderResults([]);
    clearMapMarkers();
  }
}

async function generateBriefing() {
  const topic = briefTopicInput.value.trim();
  const rawCountries = briefCountriesInput.value
    .split(",")
    .map((country) => country.trim())
    .filter(Boolean);

  if (!topic) {
    setBriefStatus("Escribe un tema para generar el briefing.");
    renderBriefing([]);
    return;
  }

  if (!rawCountries.length) {
    setBriefStatus("Escribe al menos un país.");
    renderBriefing([]);
    return;
  }

  setBriefStatus("Generando briefing geopolítico...");

  const groups = [];
  const placesToMap = [];

  for (const rawCountry of rawCountries) {
    const key = normalizeKey(rawCountry);
    const place = gazetteer[key];

    if (!place) {
      groups.push({
        country: rawCountry,
        analysis: "País no reconocido en esta versión.",
        items: [],
        place: null
      });
      continue;
    }

    try {
      const items = await fetchNewsForPlace(place, topic);

      groups.push({
        country: place.name,
        analysis: inferCountryAnalysis(place.name, items, topic),
        items,
        place
      });

      if (items.length) {
        placesToMap.push({ place, count: items.length });
      }
    } catch (err) {
      console.error(err);
      groups.push({
        country: place.name,
        analysis: `Error obteniendo noticias para ${place.name}.`,
        items: [],
        place
      });
    }
  }

  const summaryText = buildGeoPoliticalSummary(topic, groups);
  renderBriefing(groups, summaryText);

  clearMapMarkers();
  placesToMap.forEach(({ place, count }) => addCountryMarker(place, count, topic));
  fitMapToPlaces(placesToMap.map((item) => item.place));

  const countriesOk = groups.filter((group) => group.items && group.items.length > 0).length;
  setBriefStatus(`Briefing generado para ${countriesOk} país(es) sobre "${topic}".`);
}

function clearBriefing() {
  briefTopicInput.value = "";
  briefingResultsEl.innerHTML = `
    <div class="card">
      <div class="summary">Todavía no se ha generado ningún briefing.</div>
    </div>
  `;
  setBriefStatus("Introduce un tema y varios países separados por comas.");
  clearMapMarkers();
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
briefBtn.addEventListener("click", generateBriefing);
clearBriefBtn.addEventListener("click", clearBriefing);

queryInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchNews();
});

countryInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchNews();
});

briefTopicInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") generateBriefing();
});

briefCountriesInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") generateBriefing();
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
