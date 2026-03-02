import fs from "fs";
import Parser from "rss-parser";

const parser = new Parser({
  timeout: 20000,
  headers: {
    "User-Agent": "guardovich-teletexto/1.0 (+GitHub Actions)"
  }
});

// Puedes cambiar/añadir feeds aquí
const FEEDS = {
  "101": {
    header: "101  TECNOLOGÍA Y SOCIEDAD",
    maxItems: 8,
    feeds: [
      "https://www.technologyreview.com/feed/"
    ]
  },
  "120": {
    header: "120  CIENCIA Y ESPACIO",
    maxItems: 8,
    feeds: [
      "https://www.nasa.gov/rss/dyn/breaking_news.rss"
    ]
  },
  "140": {
    header: "140  NOTICIAS TECNOLÓGICAS",
    maxItems: 8,
    feeds: [
      "http://feeds.bbci.co.uk/news/technology/rss.xml"
    ]
  }
};

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
  return (feed.items || []).map(it => ({
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
          title: `ERROR cargando feed`,
          link: url,
          summary: String(e?.message || e),
          isoDate: new Date().toISOString()
        });
      }
    }

    // Orden por fecha si existe
    all.sort((a, b) => {
      const da = Date.parse(a.isoDate || "") || 0;
      const db = Date.parse(b.isoDate || "") || 0;
      return db - da;
    });

    const clean = dedupeByLink(all).slice(0, cfg.maxItems);

    pages[page] = {
      header: cfg.header,
      maxItems: cfg.maxItems,
      items: clean
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

main().catch(err => {
  console.error(err);
  process.exit(1);
});
