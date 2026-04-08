export default {
  async fetch(request) {
    const url = new URL(request.url);

    const q = (url.searchParams.get("q") || "").trim();
    const place = (url.searchParams.get("place") || "").trim();
    const hl = url.searchParams.get("hl") || "es-ES";
    const gl = url.searchParams.get("gl") || "ES";
    const ceid = url.searchParams.get("ceid") || "ES:es";

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    let rssUrl = "";
    if (q && place) {
      rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(`${q} ${place}`)}&hl=${encodeURIComponent(hl)}&gl=${encodeURIComponent(gl)}&ceid=${encodeURIComponent(ceid)}`;
    } else if (place) {
      rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(place)}&hl=${encodeURIComponent(hl)}&gl=${encodeURIComponent(gl)}&ceid=${encodeURIComponent(ceid)}`;
    } else if (q) {
      rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=${encodeURIComponent(hl)}&gl=${encodeURIComponent(gl)}&ceid=${encodeURIComponent(ceid)}`;
    } else {
      rssUrl = `https://news.google.com/rss?hl=${encodeURIComponent(hl)}&gl=${encodeURIComponent(gl)}&ceid=${encodeURIComponent(ceid)}`;
    }

    try {
      const rssRes = await fetch(rssUrl, {
        headers: {
          "User-Agent": "news-globe-worker/1.0"
        }
      });

      const xml = await rssRes.text();
      const items = parseRssItems(xml);

      return new Response(JSON.stringify({
        ok: true,
        source: rssUrl,
        count: items.length,
        items
      }), {
        status: 200,
        headers
      });
    } catch (error) {
      return new Response(JSON.stringify({
        ok: false,
        error: error.message
      }), {
        status: 500,
        headers
      });
    }
  }
};

function decodeXml(str = "") {
  return str
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

function stripTags(str = "") {
  return decodeXml(str).replace(/<[^>]*>/g, "").trim();
}

function matchOne(block, regex) {
  const m = block.match(regex);
  return m ? m[1].trim() : "";
}

function parseRssItems(xml = "") {
  const itemBlocks = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => m[1]);

  return itemBlocks.slice(0, 20).map(block => {
    const title = stripTags(matchOne(block, /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>([\s\S]*?)<\/title>/i).replace(/^.*?$/, (s)=>s));
    const link = stripTags(matchOne(block, /<link>([\s\S]*?)<\/link>/i));
    const pubDate = stripTags(matchOne(block, /<pubDate>([\s\S]*?)<\/pubDate>/i));
    const descriptionRaw = matchOne(block, /<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>([\s\S]*?)<\/description>/i);
    const description = stripTags(descriptionRaw);

    let source = "";
    const sourceMatch = block.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
    if (sourceMatch) source = stripTags(sourceMatch[1]);

    return {
      title: title || "Sin título",
      link,
      pubDate,
      source: source || "Google News",
      summary: description.slice(0, 240)
    };
  });
}
