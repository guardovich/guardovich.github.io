// scripts/teletexto-rss-to-json.mjs
import fs from "fs";
import Parser from "rss-parser";

const parser = new Parser({
  timeout: 20000,
  headers: {
    "User-Agent": "guardovich-teletexto/1.0 (+GitHub Actions)"
  }
});

// Football Data API key via GitHub Actions secret env
const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY;

// =========================
// CONFIG: PÁGINAS RSS
// =========================
const FEEDS = {
  "101": {
    header: "101  TECNOLOGÍA",
    maxItems: 10,
    feeds: [
      "https://www.technologyreview.com/feed/",
      "http://feeds.arstechnica.com/arstechnica/index",
      "https://www.theverge.com/rss/index.xml"
    ]
  },
  "120": {
    header: "120  CIENCIA",
    maxItems: 10,
    feeds: [
      "https://www.nasa.gov/rss/dyn/breaking_news.rss",
      "https://www.science.org/action/showFeed?type=etoc&feed=rss&jc=science",
      "https://www.nature.com/nature.rss"
    ]
  },
  "140": {
    header: "140  NOTICIAS",
    maxItems: 10,
    feeds: [
      "http://feeds.bbci.co.uk/news/technology/rss.xml",
      "https://www.reutersagency.com/feed/?best-topics=technology"
    ]
  },
  "160": {
    header: "160  INTELIGENCIA ARTIFICIAL",
    maxItems: 10,
    feeds: [
      "https://news.mit.edu/topic/mitartificial-intelligence2-rss.xml",
      "https://deepmind.google/blog/rss.xml",
      "https://openai.com/blog/rss.xml"
    ]
  },
  "180": {
    header: "180  EDITORIAL",
    maxItems: 8,
    feeds: [
      "https://theconversation.com/global/topics/technology-12/articles.rss",
      "https://spectrum.ieee.org/rss/fulltext",
      "https://www.brookings.edu/topic/technology/feed/"
    ]
  }
};

// =========================
// RSS HELPERS
// =========================
function pickSummary(item) {
  return (
    item.contentSnippet ||
    item.summary ||
    item.content ||
    item["content:encodedSnippet"] ||
    item["content:encoded"] ||
    item.description ||
    ""
  );
}

async function loadFeed(url) {
  const feed = await parser.parseURL(url);
  return (feed.items || []).map((it) => ({
    title: it.title || "",
    link: it.link || "",
    summary: pickSummary(it),
    isoDate: it.isoDate || it.pubDate || ""
  }));
}

function dedupeByLink(items) {
  const seen = new Set();
  const out = [];
  for (const it of items) {
    const key = it.link || (it.title + "|" + it.isoDate);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

function sortByDateDesc(items) {
  items.sort((a, b) => {
    const da = Date.parse(a.isoDate || "") || 0;
    const db = Date.parse(b.isoDate || "") || 0;
    return db - da;
  });
  return items;
}

// =========================
// FOOTBALL (LaLiga) HELPERS
// =========================
function abbr(name = "") {
  // Abreviador sencillo estilo teletexto (3 letras)
  const n = String(name).toUpperCase();
  const clean = n.replace(/[^A-ZÁÉÍÓÚÜÑ ]/g, "").trim();
  const parts = clean.split(/\s+/);
  const base = (parts[0] || clean).slice(0, 3);
  return base.padEnd(3, " ");
}

function safeNum(x) {
  return x === null || x === undefined ? "-" : String(x);
}

async function loadLaLigaPage200() {
  const header = "200  PRIMERA DIVISIÓN";

  if (!FOOTBALL_API_KEY) {
    return {
      header: "200  PRIMERA DIVISIÓN (SIN API KEY)",
      maxItems: 30,
      items: [
        {
          title: "Configura el secret FOOTBALL_API_KEY",
          link: "https://www.football-data.org/",
          summary: "Repo → Settings → Secrets and variables → Actions."
        }
      ]
    };
  }

  const headers = { "X-Auth-Token": FOOTBALL_API_KEY };

  // LIVE (si hay)
  const liveRes = await fetch(
    "https://api.football-data.org/v4/competitions/PD/matches?status=LIVE",
    { headers }
  );
  const liveData = await liveRes.json();

  // Últimos finalizados (fallback)
  const finRes = await fetch(
    "https://api.football-data.org/v4/competitions/PD/matches?status=FINISHED",
    { headers }
  );
  const finData = await finRes.json();

  // Clasificación
  const tableRes = await fetch(
    "https://api.football-data.org/v4/competitions/PD/standings",
    { headers }
  );
  const tableData = await tableRes.json();

  const items = [];

  const live = Array.isArray(liveData?.matches) ? liveData.matches : [];
  const finished = Array.isArray(finData?.matches) ? finData.matches : [];

  finished.sort(
    (a, b) => (Date.parse(b.utcDate || "") || 0) - (Date.parse(a.utcDate || "") || 0)
  );
  const recentFinished = finished.slice(0, 12);

  // ===== RESULTADOS =====
  items.push({
    title: live.length ? "RESULTADOS (EN DIRECTO)" : "RESULTADOS (ÚLTIMOS)",
    link: "https://www.laliga.com/",
    summary: ""
  });

  const pickMatches = live.length ? live.slice(0, 10) : recentFinished.slice(0, 10);

  for (const m of pickMatches) {
    const h = abbr(m?.homeTeam?.shortName || m?.homeTeam?.name || "HOME");
    const a = abbr(m?.awayTeam?.shortName || m?.awayTeam?.name || "AWAY");

    // En LIVE, fullTime a veces viene null. Probamos regularTime/halfTime como fallback.
    const hs =
      m?.score?.fullTime?.home ??
      m?.score?.regularTime?.home ??
      m?.score?.halfTime?.home ??
      "-";
    const as =
      m?.score?.fullTime?.away ??
      m?.score?.regularTime?.away ??
      m?.score?.halfTime?.away ??
      "-";

    const line = `${h} ${safeNum(hs).padStart(2, " ")}-${safeNum(as).padEnd(
      2,
      " "
    )} ${a}`;

    items.push({
      title: line,
      link: m?.id ? `https://www.laliga.com/` : "https://www.laliga.com/",
      summary: m?.status || ""
    });
  }

  // ===== CLASIFICACIÓN =====
  items.push({
    title: "CLASIFICACIÓN (TOP 10)",
    link: "https://www.laliga.com/",
    summary: ""
  });

  const table =
    tableData?.standings?.find((s) => s.type === "TOTAL")?.table ||
    tableData?.standings?.[0]?.table ||
    [];

  for (const row of table.slice(0, 10)) {
    const pos = String(row.position).padStart(2, " ");
    const t = abbr(row?.team?.shortName || row?.team?.name || "TEAM");
    const pts = String(row.points).padStart(3, " ");
    items.push({
      title: `${pos}. ${t}  ${pts} pts`,
      link: row?.team?.website || "https://www.laliga.com/",
      summary: ""
    });
  }

  return { header, maxItems: 40, items };
}

// =========================
// MAIN
// =========================
async function main() {
  const pages = {};

  // RSS pages
  for (const [page, cfg] of Object.entries(FEEDS)) {
    const all = [];
    for (const url of cfg.feeds) {
      try {
        const items = await loadFeed(url);
        all.push(...items);
      } catch (e) {
        all.push({
          title: "ERROR cargando feed",
          link: url,
          summary: String(e?.message || e),
          isoDate: new Date().toISOString()
        });
      }
    }

    sortByDateDesc(all);
    const clean = dedupeByLink(all).slice(0, cfg.maxItems);

    pages[page] = {
      header: cfg.header,
      maxItems: cfg.maxItems,
      items: clean
    };
  }

  // Football page 200
  try {
    pages["200"] = await loadLaLigaPage200();
  } catch (e) {
    pages["200"] = {
      header: "200  PRIMERA DIVISIÓN (ERROR)",
      maxItems: 30,
      items: [
        {
          title: "ERROR cargando fútbol",
          link: "https://www.football-data.org/",
          summary: String(e?.message || e)
        }
      ]
    };
  }

  const out = {
    generatedAt: new Date().toISOString(),
    pages
  };

  fs.mkdirSync("assets", { recursive: true });
  fs.writeFileSync("assets/teletexto.json", JSON.stringify(out, null, 2), "utf8");
  console.log("Wrote assets/teletexto.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
