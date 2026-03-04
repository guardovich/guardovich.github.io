/* ======================
CONFIG
====================== */

// "henry" SHA-256 hex
const SOCIO_KEY_SHA256_HEX =
  "927a3aed189d610b2e151c4208913b3ed0cb38f6be613756819b1513c8924d7f";

const STORAGE_FLAG = "potes_socio_ok_v1";
const INTRO_SEEN = "potes_intro_seen_v1";

/* ======================
DEBUG (visible + consola)
====================== */

function dbg(msg){
  try{
    const lines = document.getElementById("introLines");
    if(lines){
      const d = document.createElement("div");
      d.className = "introLine";
      d.textContent = "DBG: " + msg;
      lines.appendChild(d);
    }
  } catch(_){}
  console.log("DBG:", msg);
}

window.addEventListener("error", (e) => {
  dbg("JS ERROR: " + (e?.message || e));
});
window.addEventListener("unhandledrejection", (e) => {
  dbg("PROMISE ERROR: " + (e?.reason?.message || e?.reason || "unknown"));
});

/* ======================
HELPERS
====================== */

async function sha256Hex(str){
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,"0")).join("");
}

function euro(n){
  return new Intl.NumberFormat("es-ES", { style:"currency", currency:"EUR" }).format(n);
}

function fmtDateISO(iso){
  return iso || "—";
}

function priceClass(price){
  if(price <= 2.0) return "p-green";
  if(price <= 2.3) return "p-yellow";
  return "p-red";
}

function eurPer100ml(item){
  const ml = item.volume_ml || 200;
  return (item.price / ml) * 100;
}

function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

/* ======================
STATE
====================== */

let DATA = null;
let view = [];
let currentView = "ranking";

/* ======================
INTRO (retro)
====================== */

let audioCtx = null;

function beep(freq=880, ms=35, vol=0.02){
  if(!audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = "square";
  o.frequency.value = freq;
  g.gain.value = vol;
  o.connect(g);
  g.connect(audioCtx.destination);
  o.start();
  setTimeout(() => o.stop(), ms);
}

async function typeLineHTML(container, html, {speed=14, beeps=true} = {}){
  const line = document.createElement("div");
  line.className = "introLine";
  container.appendChild(line);

  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  const text = tmp.textContent || "";

  const cursor = document.createElement("span");
  cursor.className = "cursor";
  cursor.textContent = "▌";

  for(let i=0;i<text.length;i++){
    line.textContent = text.slice(0, i+1) + " ";
    line.appendChild(cursor);
    if(beeps && text[i] !== " " && text[i] !== "·") beep(880, 10, 0.015);
    await sleep(speed);
  }
  line.innerHTML = html;
}

async function runIntro(){
  dbg("runIntro() called");

  const intro = document.getElementById("intro");
  const lines = document.getElementById("introLines");
  const bar = document.getElementById("barInner");
  const pct = document.getElementById("pct");
  const hint = document.getElementById("introHint");

  if(!intro || !lines || !bar || !pct){
    dbg("Missing intro DOM nodes (introLines/barInner/pct). Check index.html ids.");
    showGate();
    if(intro) intro.classList.add("hidden");
    return;
  }

  if(hint) hint.style.display = "none";
  lines.innerHTML = "";
  bar.style.width = "0%";
  pct.textContent = "00%";

  const script = [
    `<span class="tag">[BOOT]</span> Iniciando sistema…`,
    `<span class="tag">[SYS]</span> Acceso: <span class="ok">SOCIOS</span> · Amenaza: <span class="warn">COLEGAS CON SED</span>`,
    `<span class="tag">[DB]</span> Cargando bares · precios · tapas…`,
    `<span class="tag">[UI]</span> Activando teletexto retro…`,
    `<span class="tag">[OK]</span> Preparado. Abriendo puerta de acceso…`
  ];

  for(const t of script){
    await typeLineHTML(lines, t, {speed: 12, beeps: true});
    await sleep(120);
  }

  for(let i=0;i<=100;i+=2){
    bar.style.width = `${i}%`;
    pct.textContent = `${String(i).padStart(2,"0")}%`;
    if(i % 10 === 0) beep(660, 18, 0.018);
    await sleep(22);
  }

  await sleep(120);

  localStorage.setItem(INTRO_SEEN, "1");
  intro.classList.add("hidden");
  showGate();
}

function showGate(){
  const gate = document.getElementById("gate");
  const app = document.getElementById("app");
  if(gate) gate.classList.remove("hidden");
  if(app) app.classList.add("hidden");
  const key = document.getElementById("key");
  if(key) key.focus();
}

function showApp(){
  const gate = document.getElementById("gate");
  const app = document.getElementById("app");
  if(gate) gate.classList.add("hidden");
  if(app) app.classList.remove("hidden");
}

function armIntro(){
  const intro = document.getElementById("intro");
  const btn = document.getElementById("btnStartIntro");

  const start = async () => {
    dbg("START intro (triggered)");
    if(!audioCtx){
      try{
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        dbg("AudioContext OK");
      } catch(e){
        dbg("AudioContext FAIL (no pasa nada)");
      }
    }
    beep(880, 60, 0.02);
    await runIntro();
  };

  if(btn){
    btn.addEventListener("click", start);
    dbg("Start button wired");
  } else {
    dbg("No btnStartIntro found (still ok, click/enter should work)");
  }

  if(intro){
    intro.addEventListener("click", start);
    dbg("Intro click wired");
  } else {
    dbg("No #intro found");
  }

  // ENTER SIEMPRE
  window.addEventListener("keydown", (e) => {
    if(e.key === "Enter") start();
  });
  dbg("Keydown Enter wired");
}

/* ======================
DATA
====================== */

async function loadData(){
  const res = await fetch("data.json", { cache: "no-store" });
  if(!res.ok) throw new Error("No se pudo cargar data.json (¿está en /potes/?)");
  DATA = await res.json();
  view = [...(DATA.items || [])];
}

/* ======================
RENDER
====================== */

function applyFilterAndView(){
  const q = (document.getElementById("q")?.value || "").trim().toLowerCase();

  let list = [...view];

  if(currentView === "baratos"){
    list = list.filter(it => (it.price ?? 999) <= 2.0);
  }

  if(q){
    list = list.filter(it => {
      const hay = [
        it.name, it.zone, it.tapa, it.ambiente, it.tirador,
        ...(it.tags || []),
        String(it.price ?? ""), String(it.volume_ml ?? "")
      ].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }

  return list;
}

function render(){
  const table = document.getElementById("table");
  const meta = document.getElementById("meta");
  if(!table || !meta){
    dbg("Missing #table or #meta in DOM");
    return;
  }

  const filtered = applyFilterAndView();

  meta.textContent = `Actualizado (lista): ${DATA?.updated || "—"} · Bares: ${filtered.length}`;

  table.innerHTML = filtered.map((it, idx) => {
    const p = it.price ?? 999;
    const pcls = priceClass(p);
    const isGreenRow = p <= 2.0;

    const eur100 = eurPer100ml(it);
    const eur100Txt = isFinite(eur100) ? `${eur100.toFixed(2)}€/100ml` : "—";

    const tags = [
      it.zone ? `ZONA: ${String(it.zone).toUpperCase()}` : null,
      it.tapa ? `TAPA: ${String(it.tapa).toUpperCase()}` : null,
      it.ambiente ? `AMBIENTE: ${String(it.ambiente).toUpperCase()}` : null
    ].filter(Boolean).map(x => `<span class="chip">${x}</span>`).join(" ");

    return `
      <div class="trow ${isGreenRow ? "isGreen" : ""}">
        <div class="rank">${String(idx+1).padStart(2,"0")}</div>

        <div class="name">
          ${it.name || "—"}
          <div class="small">Precio verificado: ${fmtDateISO(it.updated_price)} · ${(it.volume_ml ?? "—")}ml · ${eur100Txt}</div>
        </div>

        <div class="${pcls}">${euro(p)}</div>

        <div class="tags">${tags}</div>
      </div>
    `;
  }).join("");
}

function renderStats(){
  const table = document.getElementById("table");
  const meta = document.getElementById("meta");
  if(!table || !meta) return;

  const prices = view.map(v => v.price).filter(x => typeof x === "number" && isFinite(x));
  const avg = prices.length ? prices.reduce((a,b)=>a+b,0)/prices.length : 0;
  const min = prices.length ? Math.min(...prices) : 0;
  const max = prices.length ? Math.max(...prices) : 0;

  const cheap = view.find(v => v.price === min);
  const expensive = view.find(v => v.price === max);

  meta.textContent = `Actualizado (lista): ${DATA?.updated || "—"} · Bares: ${view.length}`;

  table.innerHTML = `
    <div class="panel" style="margin-top:0;">
      <div class="name">ESTADÍSTICAS</div>
      <div class="small">Lectura rápida del estado de la sed.</div>
      <div style="margin-top:10px;">
        <div class="chip">Precio medio: ${avg.toFixed(2)}€</div>
        <div class="chip">Más barato: ${cheap ? cheap.name : "—"} (${min ? euro(min) : "—"})</div>
        <div class="chip">Más caro: ${expensive ? expensive.name : "—"} (${max ? euro(max) : "—"})</div>
        <div class="chip">Total bares: ${view.length}</div>
      </div>
    </div>
  `;
}

/* ======================
SORT
====================== */

function sortByPrice(){
  view.sort((a,b) => (a.price ?? 9e9) - (b.price ?? 9e9));
  currentView === "stats" ? renderStats() : render();
}

function sortByName(){
  view.sort((a,b) => (a.name||"").localeCompare(b.name||"", "es"));
  currentView === "stats" ? renderStats() : render();
}

/* ======================
LOGIN
====================== */

async function enter(){
  const msg = document.getElementById("gateMsg");
  if(msg) msg.textContent = "";

  const key = (document.getElementById("key")?.value || "").trim();
  if(!key){
    if(msg) msg.textContent = "Introduce la clave.";
    return;
  }

  const h = await sha256Hex(key);
  if(h !== SOCIO_KEY_SHA256_HEX){
    if(msg) msg.textContent = "Clave incorrecta.";
    return;
  }

  localStorage.setItem(STORAGE_FLAG, "1");
  showApp();

  await loadData();
  sortByPrice();
}

function logout(){
  localStorage.removeItem(STORAGE_FLAG);
  showGate();
}

/* ======================
INIT
====================== */

window.addEventListener("DOMContentLoaded", async () => {
  dbg("DOMContentLoaded");

  document.getElementById("btnEnter")?.addEventListener("click", enter);
  document.getElementById("key")?.addEventListener("keydown", (e) => {
    if(e.key === "Enter") enter();
  });

  document.getElementById("btnLogout")?.addEventListener("click", logout);
  document.getElementById("btnSortPrice")?.addEventListener("click", sortByPrice);
  document.getElementById("btnSortName")?.addEventListener("click", sortByName);

  document.getElementById("q")?.addEventListener("input", () => {
    currentView === "stats" ? renderStats() : render();
  });

  document.querySelectorAll(".navBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentView = btn.dataset.view || "ranking";
      if(currentView === "stats") renderStats();
      else render();
    });
  });

  const seen = localStorage.getItem(INTRO_SEEN) === "1";
  const logged = localStorage.getItem(STORAGE_FLAG) === "1";
  dbg(`seenIntro=${seen} logged=${logged}`);

  if(!seen){
    document.getElementById("intro")?.classList.remove("hidden");
    document.getElementById("gate")?.classList.add("hidden");
    document.getElementById("app")?.classList.add("hidden");
    armIntro();
    dbg("Intro armed (press ENTER/click/EMPEZAR)");
    return;
  }

  document.getElementById("intro")?.classList.add("hidden");

  if(logged){
    showApp();
    try{
      await loadData();
      sortByPrice();
      dbg("Auto-login OK");
    }catch(e){
      dbg("Auto-login loadData failed: " + (e?.message || e));
    }
  }else{
    showGate();
    dbg("Showing gate (enter password)");
  }
});
