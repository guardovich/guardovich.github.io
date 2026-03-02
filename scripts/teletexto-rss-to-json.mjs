// scripts/teletexto-rss-to-json.mjs
import fs from "fs";
import Parser from "rss-parser";

const parser = new Parser({
  timeout: 20000,
  headers: { "User-Agent": "guardovich-teletexto/1.0 (+GitHub Actions)" }
});

const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY;

// ---------- Helpers: timeouts ----------
async function fetchTextWithTimeout(url, options = {}, ms = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

async function fetchJsonWithTimeout(url, options = {}, ms = 15000) {
  const text = await fetchTextWithTimeout(url, options, ms);
  return JSON.parse(text);
}

// ---------- Config RSS ----------
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

// ---------- RSS helpers ----------
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

// RSS robusto: descargamos XML con timeout y lo parseamos
async function loadFeed(url) {
  const xml = await fetchTextWithTimeout(url, {}, 15000);
  const feed = await parser.parseString(xml);
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

// ---------- Football helpers ----------
function abbr(name = "") {
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

  try {
    const liveData = await fetchJsonWithTimeout(
      "https://api.football-data.org/v4/competitions/PD/matches?status=LIVE",
      { headers },
      15000
    );

    const finData = await fetchJsonWithTimeout(
      "https://api.football-data.org/v4/competitions/PD/matches?status=FINISHED",
      { headers },
      15000
    );

    const tableData = await fetchJsonWithTimeout(
      "https://api.football-data.org/v4/competitions/PD/standings",
      { headers },
      15000
    );

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
      link: "",
      summary: ""
    });

    const pickMatches = live.length ? live.slice(0, 10) : recentFinished.slice(0, 10);

    for (const m of pickMatches) {
      const h = abbr(m?.homeTeam?.shortName || m?.homeTeam?.name || "HOME");
      const a = abbr(m?.awayTeam?.shortName || m?.awayTeam?.name || "AWAY");

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

      items.push({
        title: `${h} ${safeNum(hs).padStart(2, " ")}-${safeNum(as).padEnd(2, " ")} ${a}`,
        link: "",
        summary: ""
      });
    }

    // ===== CLASIFICACIÓN COMPLETA =====
    items.push({ title: "CLASIFICACIÓN", link: "", summary: "" });
    items.push({ title: "POS EQ  PJ  G  E  P  GF  GC  DG  PTS", link: "", summary: "" });

    const table =
      tableData?.standings?.find((s) => s.type === "TOTAL")?.table ||
      tableData?.standings?.[0]?.table ||
      [];

    for (const row of table) {
      const pos = String(row.position).padStart(2, " ");
      const eq  = abbr(row?.team?.shortName || row?.team?.name || "TEAM");
      const pj  = String(row.playedGames).padStart(2, " ");
      const g   = String(row.won).padStart(2, " ");
      const e   = String(row.draw).padStart(2, " ");
      const p   = String(row.lost).padStart(2, " ");
      const gf  = String(row.goalsFor).padStart(2, " ");
      const gc  = String(row.goalsAgainst).padStart(2, " ");
      const dg  = String(row.goalDifference).padStart(3, " ");
      const pts = String(row.points).padStart(3, " ");

      items.push({
        title: `${pos}  ${eq}  ${pj}  ${g} ${e} ${p}  ${gf}  ${gc} ${dg} ${pts}`,
        link: "",
        summary: ""
      });
    }

    // max alto para que quepa tabla completa
    return { header, maxItems: 120, items };
  } catch (e) {
    return {
      header: "200  PRIMERA DIVISIÓN (TEMP NO DISP.)",
      maxItems: 10,
      items: [
        { title: "No se pudo cargar fútbol ahora", link: "https://www.football-data.org/", summary: String(e?.message || e) },
        { title: "Se intentará en la próxima actualización", link: "https://www.laliga.com/", summary: "" }
      ]
    };
  }
}

// ---------- Main ----------
async function main() {
  const pages = {};

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

    pages[page] = { header: cfg.header, maxItems: cfg.maxItems, items: clean };
  }

  pages["200"] = await loadLaLigaPage200();

  const out = { generatedAt: new Date().toISOString(), pages };

  fs.mkdirSync("assets", { recursive: true });
  fs.writeFileSync("assets/teletexto.json", JSON.stringify(out, null, 2), "utf8");
  console.log("Wrote assets/teletexto.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
