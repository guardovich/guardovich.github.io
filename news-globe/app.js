console.log("APP JS CARGADO OK");

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

const activeTopicEl = document.getElementById("activeTopic");
const activeCountriesEl = document.getElementById("activeCountries");
const headlineCountEl = document.getElementById("headlineCount");
const lastUpdateEl = document.getElementById("lastUpdate");
const geoTickerEl = document.getElementById("geoTicker");
const marketBoardEl = document.getElementById("marketBoard");
const retroTickerTrackEl = document.getElementById("retroTickerTrack");

const clockMadridEl = document.getElementById("clockMadrid");
const clockLondonEl = document.getElementById("clockLondon");
const clockNewYorkEl = document.getElementById("clockNewYork");
const clockBeijingEl = document.getElementById("clockBeijing");
const clockTokyoEl = document.getElementById("clockTokyo");
const clockMoscowEl = document.getElementById("clockMoscow");

const tensionIndexEl = document.getElementById("tensionIndex");
const mediaMoodEl = document.getElementById("mediaMood");
const defconSignalEl = document.getElementById("defconSignal");
const narrativeBiasEl = document.getElementById("narrativeBias");
const hotspotsBoardEl = document.getElementById("hotspotsBoard");

/* 
  PEGA AQUÍ TU GAZETTEER COMPLETO
  Puedes ampliar esta lista cuando quieras.
*/

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

/* =========================
   ESTADO GLOBAL
========================= */

/* =========================
   ESTADO GLOBAL
========================= */
let spinning = false;
let spinFrame = null;
let activeMarkers = [];

const mockMarkets = [
  { label: "IBEX", value: "11,284", change: "+0.42%" },
  { label: "S&P", value: "5,918", change: "-0.18%" },
  { label: "NASDAQ", value: "18,442", change: "+0.63%" },
  { label: "BRENT", value: "82.31", change: "+1.12%" },
  { label: "ORO", value: "2,348", change: "+0.27%" },
  { label: "BTC", value: "68,420", change: "-0.54%" }
];

const tensionKeywords = [
  "guerra", "crisis", "ataque", "misil", "amenaza", "escalada",
  "sancion", "sanción", "sanciones", "despliegue", "conflicto", "bloqueo",
  "frontera", "incidente", "seguridad", "defensa", "otan",
  "ejercito", "ejército", "bombardeo", "invasion", "invasión", "riesgo"
];

const negativeKeywords = [
  "crisis", "ataque", "guerra", "caida", "caída", "conflicto", "sancion",
  "sanción", "amenaza", "bloqueo", "muere", "herido", "accidente", "colapso",
  "recesion", "recesión", "desplome", "tension", "tensión", "violencia", "ciberataque"
];

const positiveKeywords = [
  "acuerdo", "avance", "crece", "mejora", "record", "récord", "exito", "éxito",
  "estabilidad", "alivio", "alto el fuego", "recuperacion", "recuperación",
  "inversion", "inversión", "cooperacion", "cooperación", "reduccion", "reducción"
];

/* =========================
   MAPA
========================= */
const map = new maplibregl.Map({
  container: "map",
  style: "https://demotiles.maplibre.org/style.json",
  center: [8, 22],
  zoom: 2.15,
  attributionControl: true
});

// FIX RESPONSIVE MAP
window.addEventListener("load", () => {
  setTimeout(() => {
    try {
      map.resize();
    } catch (e) {
      console.warn("No se pudo redimensionar el mapa en load", e);
    }
  }, 250);
});

window.addEventListener("resize", () => {
  try {
    map.resize();
  } catch (e) {
    console.warn("No se pudo redimensionar el mapa", e);
  }
});

window.addEventListener("orientationchange", () => {
  setTimeout(() => {
    try {
      map.resize();
    } catch (e) {
      console.warn("No se pudo redimensionar tras orientación", e);
    }
  }, 250);
});

map.addControl(new maplibregl.NavigationControl(), "top-right");

map.on("style.load", () => {
  if (typeof map.setProjection === "function") {
    map.setProjection({ type: "globe" });
  }

  if (typeof map.setFog === "function") {
    map.setFog({
      range: [0.5, 10],
      color: "rgba(20, 35, 70, 0.95)",
      "high-color": "rgba(5, 10, 20, 0.9)",
      "space-color": "rgba(2, 4, 10, 1)",
      "horizon-blend": 0.08
    });
  } else {
    console.warn("map.setFog no está disponible en esta versión de MapLibre");
  }

  setTimeout(() => {
    try {
      map.resize();
    } catch (e) {
      console.warn("No se pudo redimensionar el mapa tras style.load", e);
    }
  }, 80);
});

/* =========================
   HELPERS
========================= */
function setStatus(text) {
  if (statusEl) statusEl.textContent = text;
}

function setBriefStatus(text) {
  if (briefStatusEl) briefStatusEl.textContent = text;
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

function getLocalTime(timeZone) {
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone
  }).format(new Date());
}

function clampRadarValue(value) {
  return Math.max(0, Math.min(100, Math.round(value || 0)));
}

/* =========================
   DASHBOARD
========================= */
function updateDashboardStatus({ topic = "Sin tema", countries = 0, headlines = 0 } = {}) {
  if (activeTopicEl) activeTopicEl.textContent = topic;
  if (activeCountriesEl) activeCountriesEl.textContent = String(countries);
  if (headlineCountEl) headlineCountEl.textContent = String(headlines);
  if (lastUpdateEl) lastUpdateEl.textContent = getLocalTime("Europe/Madrid");
}

function updateWorldClocks() {
  if (clockMadridEl) clockMadridEl.textContent = getLocalTime("Europe/Madrid");
  if (clockLondonEl) clockLondonEl.textContent = getLocalTime("Europe/London");
  if (clockNewYorkEl) clockNewYorkEl.textContent = getLocalTime("America/New_York");
  if (clockBeijingEl) clockBeijingEl.textContent = getLocalTime("Asia/Shanghai");
  if (clockTokyoEl) clockTokyoEl.textContent = getLocalTime("Asia/Tokyo");
  if (clockMoscowEl) clockMoscowEl.textContent = getLocalTime("Europe/Moscow");
}

function renderMarketBoard() {
  if (!marketBoardEl) return;

  marketBoardEl.innerHTML = mockMarkets
    .map((item) => {
      const isNegative = item.change.startsWith("-");
      const color = isNegative ? "#ff8e8e" : "#86efac";

      return `
        <div class="hud-metric">
          <span class="hud-label">${escapeHtml(item.label)}</span>
          <span class="hud-value">${escapeHtml(item.value)}</span>
          <span class="hud-change" style="color:${color};font-size:12px;font-weight:700;">
            ${escapeHtml(item.change)}
          </span>
        </div>
      `;
    })
    .join("");
}

function updateGeoTicker(items = []) {
  if (!geoTickerEl) return;

  const cleanItems = items.filter(Boolean).slice(0, 8);

  if (!cleanItems.length) {
    geoTickerEl.innerHTML = `<span class="ticker-item">Sin flujo geopolítico disponible.</span>`;
    return;
  }

  geoTickerEl.innerHTML = cleanItems
    .map((item) => `<span class="ticker-item">${escapeHtml(item)}</span>`)
    .join("");
}

function updateRetroTicker(items = []) {
  if (!retroTickerTrackEl) return;

  const cleanItems = items
    .filter(Boolean)
    .map((item) => String(item).trim())
    .filter(Boolean)
    .slice(0, 12);

  if (!cleanItems.length) {
    retroTickerTrackEl.innerHTML = `
      <span class="retro-ticker-item">SIN NOVEDADES EN FLUJO GLOBAL</span>
      <span class="retro-ticker-item">GEONEWS MONITOR EN ESPERA</span>
    `;
    return;
  }

  const repeatedItems = [...cleanItems, ...cleanItems];

  retroTickerTrackEl.innerHTML = repeatedItems
    .map((item) => `<span class="retro-ticker-item">${escapeHtml(item)}</span>`)
    .join("");
}

/* =========================
   MARCADORES MAPA
========================= */
function clearMapMarkers() {
  activeMarkers.forEach((marker) => marker.remove());
  activeMarkers = [];
}

function buildCountryPopup(place, itemCount = 0, topic = "", items = []) {
  const tensionIndex = calculateTensionIndex(items);
  const mediaMood = detectMediaMood(items);
  const defcon = getDefconLikeSignal(tensionIndex);
  const themeCounters = detectThemesFromItems(items);
  const narrativeBias = topThemeFromCounters(themeCounters).toUpperCase();

  return `
    <div class="country-popup">
      <div class="country-popup-head">
        <div class="country-popup-title">${escapeHtml(place.name)}</div>
        <div class="country-popup-badge">${escapeHtml(place.gl || "GLOBAL")}</div>
      </div>

      <div class="country-popup-grid">
        <div class="country-popup-metric">
          <span class="country-popup-label">Titulares</span>
          <span class="country-popup-value">${escapeHtml(String(itemCount))}</span>
        </div>

        <div class="country-popup-metric">
          <span class="country-popup-label">Tensión</span>
          <span class="country-popup-value">${escapeHtml(String(tensionIndex))}/100</span>
        </div>

        <div class="country-popup-metric">
          <span class="country-popup-label">Mood</span>
          <span class="country-popup-value">${escapeHtml(mediaMood)}</span>
        </div>

        <div class="country-popup-metric">
          <span class="country-popup-label">Bias</span>
          <span class="country-popup-value">${escapeHtml(narrativeBias)}</span>
        </div>

        <div class="country-popup-metric">
          <span class="country-popup-label">Defcon-like</span>
          <span class="country-popup-value">${escapeHtml(defcon)}</span>
        </div>

        <div class="country-popup-metric">
          <span class="country-popup-label">Idioma feed</span>
          <span class="country-popup-value">${escapeHtml(place.hl || "--")}</span>
        </div>
      </div>

      <div class="country-popup-topic">
        <strong>Tema activo:</strong> ${escapeHtml(topic || place.name)}
      </div>
    </div>
  `;
}

function addCountryMarker(place, itemCount = 0, topic = "", items = []) {
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

  const popupHtml = buildCountryPopup(place, itemCount, topic, items);

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
      zoom: 3.2,
      speed: 0.8
    });
    return;
  }

  const bounds = new maplibregl.LngLatBounds();
  validPlaces.forEach((place) => bounds.extend(place.center));

  map.fitBounds(bounds, {
    padding: 80,
    duration: 1200,
    maxZoom: 4.2
  });
}

/* =========================
   RENDER NOTICIAS
========================= */
function renderResults(items = []) {
  resultsEl.innerHTML = "";

  if (!items.length) {
    resultsEl.innerHTML = `<div class="card"><div class="summary">Sin resultados.</div></div>`;
    return;
  }

  for (const item of items) {
    const title = item.title || "Sin título";
    const link = item.link || "#";
    const source = item.source || "Fuente desconocida";
    const pubDate = item.pubDate || "";
    const summary = item.summary || "";

    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <h3><a href="${link}" target="_blank" rel="noopener noreferrer">${escapeHtml(title)}</a></h3>
      <div class="meta">${escapeHtml(source)}${pubDate ? " · " + escapeHtml(pubDate) : ""}</div>
      <div class="summary">${escapeHtml(summary)}</div>
    `;

    resultsEl.appendChild(card);
  }
}

/* =========================
   ANÁLISIS TEMÁTICO
========================= */
function detectThemesFromItems(items = []) {
  const text = items
    .map((item) => `${item.title || ""} ${item.summary || ""}`)
    .join(" ")
    .toLowerCase();

  const counters = {
    institucional: 0,
    economico: 0,
    seguridad: 0,
    regulatorio: 0,
    social: 0,
    tecnologico: 0
  };

  const rules = {
    institucional: ["gobierno", "ministerio", "presidente", "parlamento", "estado", "ejecutivo"],
    economico: ["econom", "mercado", "banco", "empresa", "industr", "inflacion", "inflación", "bolsa", "finanza"],
    seguridad: ["ejercito", "ejército", "defensa", "otan", "misil", "seguridad", "guerra", "frontera", "crisis"],
    regulatorio: ["ley", "regul", "norma", "ue", "comision", "comisión", "tribunal", "decreto"],
    social: ["migr", "mujer", "educ", "sanidad", "vivienda", "protesta", "empleo"],
    tecnologico: ["ia", "inteligencia artificial", "chip", "tecnolog", "digital", "datos", "ciber", "software"]
  };

  for (const [theme, words] of Object.entries(rules)) {
    for (const word of words) {
      if (text.includes(word)) counters[theme] += 1;
    }
  }

  return counters;
}

function topThemeFromCounters(counters) {
  const entries = Object.entries(counters).sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0] || "general";
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
    joined.includes("ejercito") ||
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
    joined.includes("comision") ||
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

function buildStructuredBriefing(topic, groups) {
  const validGroups = groups.filter((group) => group.items && group.items.length > 0);

  if (!validGroups.length) {
    return {
      executiveSummary: `No hay base suficiente para elaborar un briefing sólido sobre "${topic}".`,
      commonPatterns: "La muestra es insuficiente.",
      countryDifferences: "No se aprecian diferencias comparables.",
      geopoliticalReading: "No se puede extraer una lectura geopolítica consistente.",
      risks: "Sin datos suficientes para estimar escenarios."
    };
  }

  const analyses = validGroups.map((group) => {
    const counters = detectThemesFromItems(group.items);
    const dominantTheme = topThemeFromCounters(counters);

    return {
      country: group.country,
      dominantTheme,
      counters,
      itemCount: group.items.length
    };
  });

  const dominantThemes = analyses.map((a) => a.dominantTheme);
  const themeFrequency = {};

  dominantThemes.forEach((theme) => {
    themeFrequency[theme] = (themeFrequency[theme] || 0) + 1;
  });

  const mostCommonTheme =
    Object.entries(themeFrequency).sort((a, b) => b[1] - a[1])[0]?.[0] || "general";

  const executiveSummary = `El briefing sobre "${topic}" indica que la cobertura se concentra principalmente en un marco ${mostCommonTheme}. La muestra combina ${validGroups.length} países con enfoques distintos, aunque aparece una dimensión internacional compartida.`;

  const commonPatterns = `Se observan patrones comunes en la forma de tratar "${topic}": varios países lo conectan con implicaciones políticas, efectos sociales y proyección internacional. El volumen agregado de titulares sugiere que no se trata de una cuestión aislada, sino de un asunto con múltiples capas.`;

  const differencesText = analyses
    .map((a) => `${a.country}: predominio ${a.dominantTheme}`)
    .join("; ");

  const geopoliticalReading = `La comparación sugiere que "${topic}" no se interpreta igual en todos los contextos nacionales. Algunos medios lo presentan desde marcos institucionales o regulatorios, mientras otros lo empujan hacia la seguridad, la economía o la tecnología. Esto apunta a agendas nacionales diferentes y a prioridades geopolíticas distintas según el país.`;

  const risks = `Si la cobertura sigue evolucionando en esta línea, los principales escenarios pasan por una mayor politización del tema, más fricción regulatoria entre bloques y una posible intensificación del enfoque estratégico en los países que lo vinculan con seguridad o competencia internacional.`;

  return {
    executiveSummary,
    commonPatterns,
    countryDifferences: differencesText,
    geopoliticalReading,
    risks
  };
}

/* =========================
   RADAR
========================= */
function getRadarScores(groups = []) {
  const validGroups = groups.filter((group) => group.items && group.items.length > 0);
  const allItems = validGroups.flatMap((group) => group.items || []);

  if (!allItems.length) {
    return {
      tension: 0,
      economy: 0,
      social: 0,
      security: 0,
      coverage: 0
    };
  }

  const allThemeCounters = validGroups.reduce(
    (acc, group) => {
      const counters = detectThemesFromItems(group.items || []);
      acc.institucional += counters.institucional || 0;
      acc.economico += counters.economico || 0;
      acc.seguridad += counters.seguridad || 0;
      acc.regulatorio += counters.regulatorio || 0;
      acc.social += counters.social || 0;
      acc.tecnologico += counters.tecnologico || 0;
      return acc;
    },
    {
      institucional: 0,
      economico: 0,
      seguridad: 0,
      regulatorio: 0,
      social: 0,
      tecnologico: 0
    }
  );

  const totalCoverageBase = validGroups.reduce((acc, group) => acc + (group.items?.length || 0), 0);

  const tension = calculateTensionIndex(allItems);
  const economy = clampRadarValue((allThemeCounters.economico * 10) + (allThemeCounters.regulatorio * 4));
  const social = clampRadarValue(allThemeCounters.social * 12);
  const security = clampRadarValue(allThemeCounters.seguridad * 12);
  const coverage = clampRadarValue(totalCoverageBase * 6);

  return { tension, economy, social, security, coverage };
}

function getSingleCountryRadarScores(items = []) {
  if (!items.length) {
    return {
      tension: 0,
      economy: 0,
      social: 0,
      security: 0,
      coverage: 0
    };
  }

  const counters = detectThemesFromItems(items);

  return {
    tension: calculateTensionIndex(items),
    economy: clampRadarValue((counters.economico * 14) + (counters.regulatorio * 6)),
    social: clampRadarValue(counters.social * 18),
    security: clampRadarValue(counters.seguridad * 18),
    coverage: clampRadarValue(items.length * 10)
  };
}

function polarToCartesian(cx, cy, radius, angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad)
  };
}

function buildRadarSVG(scores, options = {}) {
  const size = options.size || 220;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = options.maxR || Math.round(size * 0.345);
  const labelOffset = options.labelOffset || 22;
  const labelSize = options.labelSize || 11;
  const dotRadius = options.dotRadius || 3.5;

  const axes = [
    { key: "tension", label: "Tensión", angle: 0 },
    { key: "economy", label: "Economía", angle: 72 },
    { key: "social", label: "Social", angle: 144 },
    { key: "security", label: "Seguridad", angle: 216 },
    { key: "coverage", label: "Cobertura", angle: 288 }
  ];

  const rings = [20, 40, 60, 80, 100];

  const ringPolygons = rings
    .map((value) => {
      const radius = (value / 100) * maxR;
      const points = axes
        .map((axis) => {
          const p = polarToCartesian(cx, cy, radius, axis.angle);
          return `${p.x},${p.y}`;
        })
        .join(" ");
      return `<polygon points="${points}" fill="none" stroke="rgba(143,192,255,0.16)" stroke-width="1" />`;
    })
    .join("");

  const axisLines = axes
    .map((axis) => {
      const p = polarToCartesian(cx, cy, maxR, axis.angle);
      return `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="rgba(143,192,255,0.20)" stroke-width="1" />`;
    })
    .join("");

  const labels = axes
    .map((axis) => {
      const p = polarToCartesian(cx, cy, maxR + labelOffset, axis.angle);
      return `<text x="${p.x}" y="${p.y}" fill="rgba(219,232,255,0.92)" font-size="${labelSize}" text-anchor="middle" dominant-baseline="middle">${axis.label}</text>`;
    })
    .join("");

  const scorePoints = axes
    .map((axis) => {
      const value = clampRadarValue(scores[axis.key]);
      const radius = (value / 100) * maxR;
      const p = polarToCartesian(cx, cy, radius, axis.angle);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  const scoreDots = axes
    .map((axis) => {
      const value = clampRadarValue(scores[axis.key]);
      const radius = (value / 100) * maxR;
      const p = polarToCartesian(cx, cy, radius, axis.angle);
      return `<circle cx="${p.x}" cy="${p.y}" r="${dotRadius}" fill="rgba(255,59,59,0.95)" stroke="rgba(255,255,255,0.8)" stroke-width="1" />`;
    })
    .join("");

  return `
    <svg class="radar-svg" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" aria-label="Signal Radar">
      <circle cx="${cx}" cy="${cy}" r="${maxR + 8}" fill="rgba(255,255,255,0.015)" stroke="rgba(143,192,255,0.08)" stroke-width="1" />
      ${ringPolygons}
      ${axisLines}
      <polygon points="${scorePoints}" fill="rgba(255,59,59,0.18)" stroke="rgba(255,90,90,0.95)" stroke-width="2" />
      ${scoreDots}
      ${labels}
    </svg>
  `;
}

function buildRadarLegend(scores) {
  const items = [
    ["Tensión", scores.tension],
    ["Economía", scores.economy],
    ["Social", scores.social],
    ["Seguridad", scores.security],
    ["Cobertura", scores.coverage]
  ];

  return items
    .map(
      ([label, value]) => `
        <div class="radar-stat">
          <span class="radar-stat-label">${escapeHtml(label)}</span>
          <span class="radar-stat-value">${clampRadarValue(value)}/100</span>
        </div>
      `
    )
    .join("");
}

function renderCountryRadarCard(group) {
  const items = group.items || [];
  const scores = getSingleCountryRadarScores(items);
  const svg = buildRadarSVG(scores, {
    size: 170,
    maxR: 55,
    labelOffset: 17,
    labelSize: 9,
    dotRadius: 2.8
  });

  const tension = calculateTensionIndex(items);
  const mood = detectMediaMood(items);
  const bias = topThemeFromCounters(detectThemesFromItems(items)).toUpperCase();

  return `
    <article class="country-radar-card">
      <div class="country-radar-head">
        <h4 class="country-radar-title">${escapeHtml(group.country)}</h4>
        <div class="country-radar-meta">
          ${escapeHtml(String(items.length))} titulares
        </div>
      </div>

      <div class="country-radar-layout">
        <div class="country-radar-visual">
          ${svg}
        </div>

        <div class="country-radar-stats">
          <div class="radar-stat">
            <span class="radar-stat-label">Tensión</span>
            <span class="radar-stat-value">${clampRadarValue(tension)}/100</span>
          </div>
          <div class="radar-stat">
            <span class="radar-stat-label">Mood</span>
            <span class="radar-stat-value">${escapeHtml(mood)}</span>
          </div>
          <div class="radar-stat">
            <span class="radar-stat-label">Bias</span>
            <span class="radar-stat-value">${escapeHtml(bias)}</span>
          </div>
          <div class="radar-stat">
            <span class="radar-stat-label">Cobertura</span>
            <span class="radar-stat-value">${clampRadarValue(scores.coverage)}/100</span>
          </div>
        </div>
      </div>
    </article>
  `;
}

/* =========================
   RENDER BRIEFING
========================= */
function renderBriefing(groups = [], analysis = null) {
  briefingResultsEl.innerHTML = "";

  if (!groups.length) {
    briefingResultsEl.innerHTML = `<div class="card"><div class="summary">Todavía no se ha generado ningún briefing.</div></div>`;
    return;
  }

  const radarScores = getRadarScores(groups);
  const radarSvg = buildRadarSVG(radarScores);
  const radarLegend = buildRadarLegend(radarScores);

  if (analysis) {
    const analysisCard = document.createElement("article");
    analysisCard.className = "card";
    analysisCard.innerHTML = `
      <h3>🌐 Resumen ejecutivo</h3>
      <div class="summary">${escapeHtml(analysis.executiveSummary || "Sin resumen.")}</div>

      <div class="brief-list">
        <div class="brief-item">
          <strong>Coincidencias</strong>
          <div class="summary">${escapeHtml(analysis.commonPatterns || "Sin coincidencias claras.")}</div>
        </div>

        <div class="brief-item">
          <strong>Diferencias por país</strong>
          <div class="summary">${escapeHtml(analysis.countryDifferences || "Sin diferencias destacadas.")}</div>
        </div>

        <div class="brief-item">
          <strong>Lectura geopolítica</strong>
          <div class="summary">${escapeHtml(analysis.geopoliticalReading || "Sin lectura geopolítica suficiente.")}</div>
        </div>

        <div class="brief-item">
          <strong>Riesgos o escenarios</strong>
          <div class="summary">${escapeHtml(analysis.risks || "No se detectan riesgos claros con la muestra actual.")}</div>
        </div>
      </div>

      <div class="radar-wrap">
        <div class="radar-title">Signal Radar</div>
        <div class="radar-box">
          ${radarSvg}
          <div class="radar-meta">
            ${radarLegend}
          </div>
        </div>
      </div>
    `;
    briefingResultsEl.appendChild(analysisCard);
  }

  const validCountryGroups = groups.filter((group) => (group.items || []).length > 0);
  if (validCountryGroups.length) {
    const comparisonCard = document.createElement("article");
    comparisonCard.className = "card";
    comparisonCard.innerHTML = `
      <h3>📡 Radar comparado por país</h3>
      <div class="summary">Perfil de cobertura por país en cinco ejes: tensión, economía, social, seguridad y cobertura.</div>
      <div class="brief-list">
        ${validCountryGroups.map((group) => renderCountryRadarCard(group)).join("")}
      </div>
    `;
    briefingResultsEl.appendChild(comparisonCard);
  }

  groups.forEach((group) => {
    const card = document.createElement("article");
    card.className = "card";

    const itemsHtml = (group.items || [])
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

/* =========================
   SENTIMIENTO Y RIESGO
========================= */
function scoreSentiment(items = []) {
  let positive = 0;
  let negative = 0;

  const text = items
    .map((item) => `${item.title || ""} ${item.summary || ""}`)
    .join(" ")
    .toLowerCase();

  positiveKeywords.forEach((word) => {
    if (text.includes(word)) positive += 1;
  });

  negativeKeywords.forEach((word) => {
    if (text.includes(word)) negative += 1;
  });

  return { positive, negative, score: positive - negative };
}

function detectMediaMood(items = []) {
  const { positive, negative } = scoreSentiment(items);

  if (negative >= positive + 3) return "NEGATIVE";
  if (positive >= negative + 3) return "POSITIVE";
  return "MIXED / NEUTRAL";
}

function calculateTensionIndex(items = []) {
  const text = items
    .map((item) => `${item.title || ""} ${item.summary || ""}`)
    .join(" ")
    .toLowerCase();

  let hits = 0;
  tensionKeywords.forEach((word) => {
    if (text.includes(word)) hits += 1;
  });

  return Math.min(100, hits * 8 + Math.min(items.length, 20) * 2);
}

function getDefconLikeSignal(tensionIndex) {
  if (tensionIndex >= 80) return "RED";
  if (tensionIndex >= 60) return "ORANGE";
  if (tensionIndex >= 40) return "YELLOW";
  if (tensionIndex >= 20) return "BLUE";
  return "GREEN";
}

function detectNarrativeBias(groups = []) {
  const themeCount = {
    institucional: 0,
    economico: 0,
    seguridad: 0,
    regulatorio: 0,
    social: 0,
    tecnologico: 0
  };

  groups.forEach((group) => {
    const counters = detectThemesFromItems(group.items || []);
    Object.keys(themeCount).forEach((key) => {
      themeCount[key] += counters[key] || 0;
    });
  });

  return topThemeFromCounters(themeCount).toUpperCase();
}

function buildHotspots(groups = []) {
  return groups
    .map((group) => ({
      country: group.country,
      count: group.items?.length || 0
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function renderHotspots(hotspots = []) {
  if (!hotspotsBoardEl) return;

  if (!hotspots.length) {
    hotspotsBoardEl.innerHTML = `
      <div class="hud-metric">
        <span class="hud-label">HOTSPOTS</span>
        <span class="hud-value">Sin datos</span>
      </div>
    `;
    return;
  }

  hotspotsBoardEl.innerHTML = hotspots
    .map(
      (item) => `
        <div class="hud-metric">
          <span class="hud-label">${escapeHtml(item.country)}</span>
          <span class="hud-value">${escapeHtml(String(item.count))} titulares</span>
        </div>
      `
    )
    .join("");
}

function updateRiskSignals({
  tensionIndex = 0,
  mediaMood = "NEUTRAL",
  defcon = "GREEN",
  narrativeBias = "GENERAL",
  hotspots = []
} = {}) {
  if (tensionIndexEl) tensionIndexEl.textContent = `${tensionIndex}/100`;
  if (mediaMoodEl) mediaMoodEl.textContent = mediaMood;
  if (defconSignalEl) defconSignalEl.textContent = defcon;
  if (narrativeBiasEl) narrativeBiasEl.textContent = narrativeBias;
  renderHotspots(hotspots);
}

/* =========================
   FETCH WORKER ROBUSTO
========================= */
async function fetchNewsForPlace(place, query = "") {
  const url = new URL(WORKER_URL);
  url.searchParams.set("place", place.name);
  url.searchParams.set("gl", place.gl);
  url.searchParams.set("hl", place.hl);
  url.searchParams.set("ceid", place.ceid);

  if (query) {
    url.searchParams.set("q", query);
  }

  console.log("Consultando Worker:", url.toString());

  let res;
  try {
    res = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store"
    });
  } catch (fetchError) {
    console.error("Fallo de red al llamar al Worker:", fetchError);
    throw new Error("No se pudo conectar con el Worker");
  }

  console.log("Status Worker:", res.status);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Respuesta no OK:", text);
    throw new Error(`HTTP ${res.status}`);
  }

  let data;
  try {
    data = await res.json();
  } catch (jsonError) {
    console.error("JSON inválido del Worker:", jsonError);
    throw new Error("Respuesta JSON inválida del Worker");
  }

  console.log("Respuesta Worker:", data);

  if (!data.ok) {
    throw new Error(data.error || "El Worker devolvió error");
  }

  return Array.isArray(data.items) ? data.items : [];
}

/* =========================
   BÚSQUEDA SIMPLE
========================= */
async function searchNews() {
  const rawCountry = countryInput.value.trim();
  const query = queryInput.value.trim();
  const key = normalizeKey(rawCountry);

  if (!rawCountry) {
    setStatus("Escribe un país o zona.");
    renderResults([]);
    clearMapMarkers();
    updateDashboardStatus({ topic: "Sin tema", countries: 0, headlines: 0 });
    updateGeoTicker([]);
    updateRetroTicker([]);
    updateRiskSignals({
      tensionIndex: 0,
      mediaMood: "NEUTRAL",
      defcon: "GREEN",
      narrativeBias: "GENERAL",
      hotspots: []
    });
    return;
  }

  const place = gazetteer[key];
  if (!place) {
    setStatus("País no encontrado todavía.");
    renderResults([]);
    clearMapMarkers();
    updateDashboardStatus({ topic: "Sin tema", countries: 0, headlines: 0 });
    updateGeoTicker([]);
    updateRetroTicker([]);
    updateRiskSignals({
      tensionIndex: 0,
      mediaMood: "NEUTRAL",
      defcon: "GREEN",
      narrativeBias: "GENERAL",
      hotspots: []
    });
    return;
  }

  setStatus(`Buscando noticias para ${place.name}...`);

  try {
    const items = await fetchNewsForPlace(place, query);
    renderResults(items);

    clearMapMarkers();
    addCountryMarker(place, items.length, query || place.name, items);
    fitMapToPlaces([place]);

    updateDashboardStatus({
      topic: query || place.name,
      countries: 1,
      headlines: items.length
    });

    updateGeoTicker(items.map((item) => item.title));
    updateRetroTicker(items.map((item) => item.title));

    const tensionIndex = calculateTensionIndex(items);
    const mediaMood = detectMediaMood(items);
    const defcon = getDefconLikeSignal(tensionIndex);
    const narrativeBias = topThemeFromCounters(detectThemesFromItems(items)).toUpperCase();
    const hotspots = [{ country: place.name, count: items.length }];

    updateRiskSignals({
      tensionIndex,
      mediaMood,
      defcon,
      narrativeBias,
      hotspots
    });

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
    updateDashboardStatus({ topic: "Error", countries: 0, headlines: 0 });
    updateGeoTicker([]);
    updateRetroTicker([]);
    updateRiskSignals({
      tensionIndex: 0,
      mediaMood: "ERROR",
      defcon: "GREEN",
      narrativeBias: "GENERAL",
      hotspots: []
    });
  }
}

/* =========================
   BRIEFING
========================= */
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
        placesToMap.push({ place, count: items.length, items });
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

  const structuredAnalysis = buildStructuredBriefing(topic, groups);
  renderBriefing(groups, structuredAnalysis);

  clearMapMarkers();
  placesToMap.forEach(({ place, count, items }) => addCountryMarker(place, count, topic, items));
  fitMapToPlaces(placesToMap.map((item) => item.place));

  const countriesOk = groups.filter((group) => group.items && group.items.length > 0).length;
  const totalHeadlines = groups.reduce((acc, group) => acc + (group.items?.length || 0), 0);

  updateDashboardStatus({
    topic,
    countries: countriesOk,
    headlines: totalHeadlines
  });

  updateGeoTicker(
    groups.flatMap((group) =>
      (group.items || []).slice(0, 2).map((item) => `${group.country}: ${item.title}`)
    )
  );

  updateRetroTicker(
    groups.flatMap((group) =>
      (group.items || []).slice(0, 2).map((item) => `${group.country} · ${item.title}`)
    )
  );

  const allItems = groups.flatMap((group) => group.items || []);
  const tensionIndex = calculateTensionIndex(allItems);
  const mediaMood = detectMediaMood(allItems);
  const defcon = getDefconLikeSignal(tensionIndex);
  const narrativeBias = detectNarrativeBias(groups);
  const hotspots = buildHotspots(groups);

  updateRiskSignals({
    tensionIndex,
    mediaMood,
    defcon,
    narrativeBias,
    hotspots
  });

  setBriefStatus(`Briefing generado para ${countriesOk} país(es) sobre "${topic}".`);
}

/* =========================
   LIMPIAR BRIEFING
========================= */
function clearBriefing() {
  briefTopicInput.value = "";
  briefingResultsEl.innerHTML = `
    <div class="card">
      <div class="summary">Todavía no se ha generado ningún briefing.</div>
    </div>
  `;
  setBriefStatus("Introduce un tema y varios países separados por comas.");
  clearMapMarkers();
  updateDashboardStatus({ topic: "Sin tema", countries: 0, headlines: 0 });
  updateGeoTicker([]);
  updateRetroTicker([]);
  updateRiskSignals({
    tensionIndex: 0,
    mediaMood: "NEUTRAL",
    defcon: "GREEN",
    narrativeBias: "GENERAL",
    hotspots: []
  });
}

/* =========================
   GIRO DEL GLOBO
========================= */
function startSpin() {
  if (spinning) return;

  spinning = true;
  if (spinBtn) spinBtn.textContent = "Parar giro";

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
  if (spinBtn) spinBtn.textContent = "Girar globo";

  if (spinFrame) {
    cancelAnimationFrame(spinFrame);
    spinFrame = null;
  }
}

/* =========================
   EVENTOS
========================= */
if (searchBtn) searchBtn.addEventListener("click", searchNews);
if (briefBtn) briefBtn.addEventListener("click", generateBriefing);
if (clearBriefBtn) clearBriefBtn.addEventListener("click", clearBriefing);

if (queryInput) {
  queryInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchNews();
  });
}

if (countryInput) {
  countryInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchNews();
  });
}

if (briefTopicInput) {
  briefTopicInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") generateBriefing();
  });
}

if (briefCountriesInput) {
  briefCountriesInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") generateBriefing();
  });
}

if (spinBtn) {
  spinBtn.addEventListener("click", () => {
    if (spinning) stopSpin();
    else startSpin();
  });
}

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
      if (countryInput) countryInput.value = country;
      setStatus(`Zona detectada: ${country}.`);
    } else {
      setStatus("No pude identificar ese país.");
    }
  } catch (err) {
    console.error(err);
    setStatus("No pude resolver la zona del clic.");
  }
});

if (geoBtn) {
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
            if (countryInput) countryInput.value = country;
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
}

/* =========================
   INIT
========================= */
function initDashboard() {
  renderMarketBoard();
  updateWorldClocks();
  updateDashboardStatus({ topic: "Sin tema", countries: 0, headlines: 0 });

  updateGeoTicker([
    "Panel global iniciado.",
    "Esperando tema para briefing.",
    "Mapa operativo.",
    "RSS geopolítico disponible."
  ]);

  updateRetroTicker([
    "GEONEWS MONITOR ONLINE",
    "GLOBAL INTELLIGENCE DASHBOARD ACTIVO",
    "ESPERANDO CONSULTAS Y BRIEFINGS"
  ]);

  updateRiskSignals({
    tensionIndex: 0,
    mediaMood: "NEUTRAL",
    defcon: "GREEN",
    narrativeBias: "GENERAL",
    hotspots: []
  });

  setTimeout(() => {
    try {
      map.resize();
    } catch (e) {
      console.warn("No se pudo redimensionar el mapa en init", e);
    }
  }, 120);
}

initDashboard();
setInterval(updateWorldClocks, 1000);
