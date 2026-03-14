/* ======================
CONFIG
====================== */

// "henry" SHA-256 hex
const SOCIO_KEY_SHA256_HEX =
  "927a3aed189d610b2e151c4208913b3ed0cb38f6be613756819b1513c8924d7f";

const STORAGE_FLAG = "potes_socio_ok_v1";
const INTRO_SEEN = "potes_intro_seen_v1";

// Intro: mínimo 2s + se queda encendida + espera ENTER
const INTRO_MIN_MS = 2000;
const INTRO_IDLE_MS = 3500;
const INTRO_WAIT_FOR_ENTER = true;

// City filter
let currentCity = "Potes"; // Potes | Santander | ALL

/* ======================
HELPERS
====================== */

async function sha256Hex(str){
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

function euro(n){
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR"
  }).format(n);
}

function fmtDateISO(iso){
  return iso || "—";
}

function sleep(ms){
  return new Promise(r => setTimeout(r, ms));
}

function priceClass(price){
  if(price <= 2.0) return "p-green";
  if(price <= 2.3) return "p-yellow";
  return "p-red";
}

function nowClock(){
  const d = new Date();
  return d.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function randomFrom(arr){
  if(!arr || !arr.length) return "";
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ======================
STATE
====================== */

let DATA = null;
let view = [];
let currentView = "ranking";
let excusaBusy = false;

/* ======================
EXCUSAS
====================== */

const EXCUSAS = [
  "Estoy terminando una cosa rapidísima y se me ha ido un poco de las manos.",
  "Salí a por una cerveza rápida y al final me he encontrado con media cuadrilla.",
  "Me he cruzado con un conocido que no veía desde hace años y se ha alargado la charla.",
  "Estoy pagando y aquí lo de dividir la cuenta se está complicando más de lo previsto.",
  "Pensaba irme hace rato pero justo ha llegado una ronda que no podía rechazar.",
  "Estoy intentando salir pero me han parado en la puerta para despedirse.",
  "Me he quedado atrapado en una conversación eterna sobre fútbol.",
  "Estoy cerrando una conversación que se ha puesto intensa de repente.",
  "Pensaba ir directo para casa pero me han liado para una última.",
  "Estoy esperando a que traigan la cuenta y aquí va con calma.",
  "Me he encontrado con un amigo que estaba de paso y nos hemos puesto al día.",
  "Estoy terminando la cerveza y salgo ya.",
  "Me he quedado un momento más porque han sacado una tapa que no esperaba.",
  "Estoy esperando a un amigo que va a pagar su parte para poder irme.",
  "Se me ha alargado un poco más de lo previsto la despedida.",
  "Me he cruzado con unos conocidos y se ha montado una pequeña tertulia.",
  "Estoy gestionando la retirada estratégica.",
  "Pensaba marcharme ya pero han empezado a hablar de un tema interesante.",
  "Estoy intentando cerrar la noche con dignidad.",
  "Se me ha complicado la salida porque justo ha empezado otra ronda.",
  "Estoy resolviendo un pequeño lío con la cuenta.",
  "Me han parado para saludar y se ha liado una conversación larga.",
  "Estoy en la fase final de retirada.",
  "Me he quedado un momento más porque estaban contando algo buenísimo.",
  "Estoy esperando el momento correcto para irme sin quedar mal.",
  "Pensaba irme ya pero justo han llegado unos conocidos.",
  "Estoy terminando la conversación y salgo.",
  "Se me ha ido un poco el tiempo sin darme cuenta.",
  "Estoy intentando despedirme pero cada vez sale otro tema.",
  "Estoy cerrando un debate absurdo que ha surgido en la mesa.",
  "Me han liado con una última rápida y estoy terminándola.",
  "Estoy gestionando la logística de salida.",
  "Me he quedado un momento más porque han empezado a contar una historia increíble.",
  "Estoy esperando a que se vacíe un poco la barra para pagar.",
  "Estoy en fase de despedidas múltiples.",
  "Se me ha cruzado media ciudad aquí dentro.",
  "Estoy terminando una charla que ha derivado en anécdotas antiguas.",
  "Estoy intentando marcharme desde hace rato pero siempre aparece alguien más.",
  "Pensaba que ya me iba pero han sacado otra ronda inesperada.",
  "Voy con un pequeño retraso logístico pero ya estoy saliendo."
];

const MARGE_REACTIONS = [
  "Mmm...",
  "A ver qué excusa es esta...",
  "Esto no me convence...",
  "Te estoy leyendo...",
  "Más te vale que sea buena..."
];

const MARGE_HAPPY_REACTIONS = [
  "Ooooh, qué aplicado eres...",
  "Bueno... te la compro.",
  "Vale, pero luego me lo cuentas.",
  "Mira qué majo...",
  "Está bien, acepto pulpo."
];

/* ======================
AUDIO
====================== */

function playAudioFile(path, volume = 0.5){
  try{
    const a = new Audio(path);
    a.volume = volume;
    a.play().catch(() => {});
    return a;
  }catch(_){
    return null;
  }
}

/* ======================
INTRO terminal typing
====================== */

let audioCtx = null;

function ensureAudio(){
  if(audioCtx) return;
  try{
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }catch(_){
    audioCtx = null;
  }
}

function tone(freq = 880, ms = 40, vol = 0.02, type = "square"){
  if(!audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = vol;
  o.connect(g);
  g.connect(audioCtx.destination);
  o.start();
  setTimeout(() => o.stop(), ms);
}

async function sfxBoot(){
  if(!audioCtx) return;
  tone(220, 60, 0.02, "square"); await sleep(70);
  tone(330, 60, 0.02, "square"); await sleep(70);
  tone(440, 60, 0.02, "square");
}

async function sfxCoin(){
  if(!audioCtx) return;
  tone(988, 45, 0.03, "square"); await sleep(55);
  tone(1319, 55, 0.03, "square"); await sleep(65);
  tone(1760, 70, 0.03, "square");
}

function beep(freq = 880, ms = 18, vol = 0.015){
  tone(freq, ms, vol, "square");
}

async function typeLineHTML(container, html, { speed = 14, beeps = true } = {}){
  const line = document.createElement("div");
  line.className = "introLine";
  container.appendChild(line);

  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  const text = tmp.textContent || "";

  const cursor = document.createElement("span");
  cursor.className = "cursor";
  cursor.textContent = "▌";

  for(let i = 0; i < text.length; i++){
    line.textContent = text.slice(0, i + 1) + " ";
    line.appendChild(cursor);
    if(beeps && text[i] !== " " && text[i] !== "·"){
      beep(880, 10, 0.012);
    }
    await sleep(speed);
  }

  line.innerHTML = html;
}

function showGate(){
  document.getElementById("gate")?.classList.remove("hidden");
  document.getElementById("app")?.classList.add("hidden");
  document.getElementById("key")?.focus();
}

function showApp(){
  document.getElementById("gate")?.classList.add("hidden");
  document.getElementById("app")?.classList.remove("hidden");
}

async function waitForEnterOrClick(introEl){
  return new Promise(resolve => {
    const onKey = (e) => {
      if(e.key === "Enter"){
        window.removeEventListener("keydown", onKey);
        resolve("enter");
      }
    };

    window.addEventListener("keydown", onKey);

    introEl?.addEventListener("click", () => {
      window.removeEventListener("keydown", onKey);
      resolve("click");
    }, { once: true });
  });
}

async function runIntro(){
  const intro = document.getElementById("intro");
  const frame = document.querySelector(".introFrame");
  const lines = document.getElementById("introLines");
  const bar = document.getElementById("barInner");
  const pct = document.getElementById("pct");
  const hint = document.getElementById("introHint");

  if(!intro || !lines || !bar || !pct){
    intro?.classList.add("hidden");
    showGate();
    return;
  }

  frame?.classList.remove("idle");

  const t0 = Date.now();

  if(hint) hint.style.display = "none";
  lines.innerHTML = "";
  bar.style.width = "0%";
  pct.textContent = "00%";

  const script = [
    `<span class="tag">[BOOT]</span> Iniciando sistema…`,
    `<span class="tag">[SYS]</span> Acceso: <span class="ok">SOCIOS</span> · Amenaza: <span class="warn">COLEGAS CON SED</span>`,
    `<span class="tag">[DB]</span> Cargando bares · precios · pros · cons…`,
    `<span class="tag">[CITY]</span> Selector: <span class="ok">Potes</span> / <span class="ok">Santander</span>`,
    `<span class="tag">[BEER]</span> Activando campo: <span class="ok">Marca</span>`,
    `<span class="tag">[AI]</span> Compilando Cucas Score™…`,
    `<span class="tag">[UI]</span> Activando teletexto / CRT…`,
    `<span class="tag">[OK]</span> Listo.`
  ];

  for(const t of script){
    await typeLineHTML(lines, t, { speed: 12, beeps: true });
    await sleep(120);
  }

  for(let i = 0; i <= 100; i += 4){
    bar.style.width = `${i}%`;
    pct.textContent = `${String(i).padStart(2, "0")}%`;
    if(i % 20 === 0) beep(660, 20, 0.018);
    await sleep(25);
  }

  const elapsed = Date.now() - t0;
  if(elapsed < INTRO_MIN_MS) await sleep(INTRO_MIN_MS - elapsed);

  if(hint) hint.style.display = "";
  await typeLineHTML(
    lines,
    `<div class="pressEnter"><span class="tag">[READY]</span> Pulsa <span class="ok">ENTER</span> para continuar…</div>`,
    { speed: 10, beeps: false }
  );

  frame?.classList.add("idle");
  if(INTRO_IDLE_MS > 0) await sleep(INTRO_IDLE_MS);

  if(INTRO_WAIT_FOR_ENTER){
    await waitForEnterOrClick(intro);
    await sfxCoin();
  }

  localStorage.setItem(INTRO_SEEN, "1");
  intro.classList.add("hidden");
  showGate();
}

function armIntro(){
  const intro = document.getElementById("intro");
  const btn = document.getElementById("btnStartIntro");

  let started = false;

  const start = async () => {
    if(started) return;
    started = true;
    ensureAudio();
    await sfxBoot();
    await runIntro();
  };

  btn?.addEventListener("click", start);
  intro?.addEventListener("click", start);

  window.addEventListener("keydown", (e) => {
    if(e.key === "Enter") start();
  });
}

/* ======================
DATA
====================== */

async function loadData(){
  const res = await fetch("data.json", { cache: "no-store" });
  if(!res.ok) throw new Error("No se pudo cargar data.json");
  DATA = await res.json();
  view = [...(DATA.items || [])];
}

/* ======================
CUCAS SCORE™
====================== */

function cucasScore(it){
  let s = 50;

  if(typeof it.price === "number"){
    if(it.price <= 2.0) s += 18;
    else if(it.price <= 2.3) s += 10;
    else s += 2;
    if(it.price >= 2.6) s -= 6;
  }

  s += (it.pros?.length || 0) * 6;
  s -= (it.cons?.length || 0) * 8;

  const amb = (it.ambiente || "").toLowerCase();
  if(amb.includes("barrio")) s += 6;
  if(amb.includes("tur")) s -= 4;

  const tapa = (it.tapa || "").toLowerCase();
  if(tapa && tapa !== "—" && tapa !== "-") s += 4;

  const allText = [...(it.pros || []), ...(it.cons || [])].join(" ").toLowerCase();
  if(allText.includes("no suele abrir")) s -= 18;
  if(allText.includes("no tiran bien") || allText.includes("no la tiran bien")) s -= 10;

  return Math.max(0, Math.min(100, Math.round(s)));
}

function cucasColorClass(score){
  if(score >= 75) return "cucasGreen";
  if(score >= 55) return "cucasYellow";
  return "cucasRed";
}

/* ======================
RENDER
====================== */

function applyFilterAndView(){
  const q = (document.getElementById("q")?.value || "").trim().toLowerCase();
  let list = [...view];

  if(currentCity !== "ALL"){
    list = list.filter(it => (it.city || "Potes") === currentCity);
  }

  if(currentView === "baratos"){
    list = list.filter(it => (it.price ?? 999) <= 2.0);
  }

  if(q){
    list = list.filter(it => {
      const hay = [
        it.name,
        it.city,
        it.zone,
        it.tapa,
        it.ambiente,
        it.beer_brand,
        ...(it.pros || []),
        ...(it.cons || []),
        String(it.price ?? "")
      ].filter(Boolean).join(" ").toLowerCase();

      return hay.includes(q);
    });
  }

  return list;
}

function renderEmpty(msg){
  const table = document.getElementById("table");
  if(!table) return;

  table.innerHTML = `
    <div class="panel" style="margin-top:0;">
      <div class="name">${msg}</div>
      <div class="small">Añade bares en <b>${currentCity}</b> a <code>data.json</code>.</div>
    </div>
  `;
}

function render(){
  const table = document.getElementById("table");
  const meta = document.getElementById("meta");
  if(!table || !meta) return;

  const filtered = applyFilterAndView();
  const cityLabel = currentCity === "ALL" ? "Todas" : currentCity;

  meta.textContent = `Actualizado: ${DATA?.updated || "—"} · Ciudad: ${cityLabel} · Bares: ${filtered.length}`;

  if(filtered.length === 0){
    renderEmpty(`NO HAY BARES PARA ${cityLabel.toUpperCase()}`);
    return;
  }

  table.innerHTML = filtered.map((it, idx) => {
    const p = it.price ?? 999;
    const pcls = priceClass(p);
    const isGreenRow = p <= 2.0;

    const prosHTML = (it.pros || []).map(pv => `<span class="pro">👍 ${pv}</span>`).join(" ");
    const consHTML = (it.cons || []).map(cv => `<span class="con">👎 ${cv}</span>`).join(" ");

    const score = cucasScore(it);
    const ccls = cucasColorClass(score);

    const chips = [
      it.city ? `<span class="chip">CIUDAD: ${String(it.city).toUpperCase()}</span>` : "",
      it.zone ? `<span class="chip">ZONA: ${String(it.zone).toUpperCase()}</span>` : "",
      it.tapa ? `<span class="chip">TAPA: ${String(it.tapa).toUpperCase()}</span>` : "",
      it.ambiente ? `<span class="chip">AMBIENTE: ${String(it.ambiente).toUpperCase()}</span>` : "",
      it.beer_brand ? `<span class="chip">CERVEZA: ${String(it.beer_brand).toUpperCase()}</span>` : ""
    ].join(" ");

    return `
      <div class="trow ${isGreenRow ? "isGreen" : ""}">
        <div class="rank">${String(idx + 1).padStart(2, "0")}</div>

        <div class="name">
          ${it.name || "—"}
          <div class="small">Precio verificado: ${fmtDateISO(it.updated_price)} · ${(it.volume_ml ?? "—")}ml</div>

          <div style="margin-top:8px;">${chips}</div>
          <div style="margin-top:8px;">${prosHTML} ${consHTML}</div>

          <div class="cucasWrap ${ccls}">
            <div class="cucasLabel">CUCAS SCORE™</div>
            <div class="cucasValue">${score}</div>
            <div class="cucasBarOuter">
              <div class="cucasBarInner" style="width:${score}%; background: currentColor;"></div>
            </div>
          </div>
        </div>

        <div class="${pcls}">${euro(p)}</div>

        <div class="tags"></div>
      </div>
    `;
  }).join("");
}

function renderStats(){
  const table = document.getElementById("table");
  const meta = document.getElementById("meta");
  if(!table || !meta) return;

  const scoped = applyFilterAndView();
  const scores = scoped.map(cucasScore);
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  const cityLabel = currentCity === "ALL" ? "Todas" : currentCity;
  meta.textContent = `Actualizado: ${DATA?.updated || "—"} · Ciudad: ${cityLabel} · Bares: ${scoped.length}`;

  table.innerHTML = `
    <div class="panel" style="margin-top:0;">
      <div class="name">ESTADÍSTICAS</div>
      <div class="small">Media Cucas Score™ (según filtros): <b>${avg}</b></div>
      <div class="small" style="margin-top:8px;color:#9aa;">
        Score = precio + pros - cons + ambiente + tapa.
      </div>
    </div>
  `;
}

/* ======================
SORTS
====================== */

function sortByPrice(){
  view.sort((a, b) => (a.price ?? 9e9) - (b.price ?? 9e9));
  currentView === "stats" ? renderStats() : render();
}

function sortByName(){
  view.sort((a, b) => (a.name || "").localeCompare(b.name || "", "es"));
  currentView === "stats" ? renderStats() : render();
}

function sortByCucas(){
  view.sort((a, b) => cucasScore(b) - cucasScore(a));
  currentView === "stats" ? renderStats() : render();
}

/* ======================
RUTA DE POTES
====================== */

function pickRandom(arr){
  if(!arr || !arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function generarRutaPotes(){
  if(!DATA || !DATA.items) return;

  const scoped = applyFilterAndView();
  const out = document.getElementById("rutaPotes");

  if(scoped.length === 0){
    if(out) out.innerHTML = `<div class="rutaTitulo">RUTA</div>No hay bares con estos filtros.`;
    return;
  }

  const puntuados = [...scoped]
    .map(bar => ({ bar, score: cucasScore(bar) }))
    .sort((a, b) => b.score - a.score);

  const pool = puntuados.slice(0, Math.min(6, puntuados.length)).map(x => x.bar);
  pool.sort(() => Math.random() - 0.5);

  const seleccion = pool.slice(0, Math.min(3, pool.length));

  let texto = `<div class="rutaTitulo">RUTA PROPUESTA 🍻 (CUCAS MODE)</div>`;

  seleccion.forEach((bar, i) => {
    const pro = pickRandom(bar.pros);
    const con = pickRandom(bar.cons);

    if(i === 0) texto += `Empezamos en <span>${bar.name}</span>`;
    else if(i === 1) texto += `, luego pasamos por <span>${bar.name}</span>`;
    else texto += ` y terminamos en <span>${bar.name}</span>`;

    if(bar.price != null) texto += ` (a ${bar.price.toFixed(2)}€)`;
    if(bar.beer_brand) texto += ` · <span>${bar.beer_brand}</span>`;
    if(pro) texto += ` porque ${String(pro).toLowerCase()}`;
    if(con) texto += ` (ojo: ${String(con).toLowerCase()})`;

    texto += ".";
  });

  if(out) out.innerHTML = texto;

  ensureAudio();
sfxCoin();
triggerBarneyDrink();
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
BARNEY
====================== */

function triggerBarneyDrink(){
  const sprite = document.getElementById("barneySprite");
  if(!sprite) return;
  if(sprite.classList.contains("drink")) return;

  sprite.classList.remove("drink");
  void sprite.offsetWidth;
  sprite.classList.add("drink");

  setTimeout(() => {
    sprite.classList.remove("drink");
  }, 1350);
}

/* ======================
EXCUSAS / NOKIA
====================== */

function vibrarNokia(){
  if(navigator.vibrate){
    navigator.vibrate([120, 60, 120, 60, 120]);
  }
}

function showRankingPanel(){
  document.getElementById("rankingPanel")?.classList.remove("hidden");
  document.getElementById("excusaPanel")?.classList.add("hidden");
}

function showExcusaPanel(){
  document.getElementById("rankingPanel")?.classList.add("hidden");
  document.getElementById("excusaPanel")?.classList.remove("hidden");
}

function setMargeAngry(){
  const marge = document.getElementById("margeSprite");
  if(!marge) return;
  marge.classList.remove("marge-happy");
  marge.classList.add("marge-angry");
}

function setMargeHappy(){
  const marge = document.getElementById("margeSprite");
  if(!marge) return;
  marge.classList.remove("marge-angry");
  marge.classList.add("marge-happy");
}

async function generarExcusa(){
  if(excusaBusy) return;
  excusaBusy = true;

  const text = document.getElementById("excusaText");
  const reaction = document.getElementById("margeReaction");
  const notice = document.getElementById("nokiaNotice");
  const phone = document.getElementById("nokiaPhone");
  const time = document.getElementById("excusaTime");

  const excusa = randomFrom(EXCUSAS);

  if(time) time.textContent = nowClock();

  setMargeAngry();

  if(reaction) reaction.textContent = randomFrom(MARGE_REACTIONS);
  if(notice) notice.textContent = "ENVIANDO MENSAJE...";
  if(text){
    text.textContent = "ENVIANDO...";
    text.classList.add("smsSending");
  }

  playAudioFile("sfx/mensaje.mp3", 0.45);

  await sleep(3000);

  playAudioFile("sfx/mensaje2.mp3", 0.55);
  vibrarNokia();

  phone?.classList.add("nokiaVibrate");
  setTimeout(() => phone?.classList.remove("nokiaVibrate"), 400);

  if(notice) notice.textContent = "1 MENSAJE NUEVO";
  if(text){
    text.classList.remove("smsSending");
    text.textContent = excusa;
  }
  if(reaction) reaction.textContent = randomFrom(MARGE_HAPPY_REACTIONS);
  if(time) time.textContent = nowClock();

  setMargeHappy();

  excusaBusy = false;
}

/* ======================
UI HELPERS
====================== */

function setActiveButtons(selector, matchFn){
  document.querySelectorAll(selector).forEach(b => {
    b.classList.toggle("active", !!matchFn(b));
  });
}

/* ======================
INIT
====================== */

window.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("btnEnter")?.addEventListener("click", enter);
  document.getElementById("key")?.addEventListener("keydown", (e) => {
    if(e.key === "Enter") enter();
  });

  document.getElementById("btnLogout")?.addEventListener("click", logout);
  document.getElementById("btnSortPrice")?.addEventListener("click", sortByPrice);
  document.getElementById("btnSortName")?.addEventListener("click", sortByName);
  document.getElementById("btnSortCucas")?.addEventListener("click", sortByCucas);
  document.getElementById("btnRuta")?.addEventListener("click", generarRutaPotes);
  document.getElementById("btnExcusa")?.addEventListener("click", generarExcusa);

  document.getElementById("q")?.addEventListener("input", () => {
    currentView === "stats" ? renderStats() : render();
  });

  document.getElementById("npcBarneyBtn")?.addEventListener("click", triggerBarneyDrink);

  showRankingPanel();

  document.querySelectorAll(".navBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentView = btn.dataset.view || "ranking";
      setActiveButtons(".navBtn", b => b.dataset.view === currentView);

      if(currentView === "excusas"){
        showExcusaPanel();
        return;
      }

      showRankingPanel();

      if(currentView === "stats") renderStats();
      else render();
    });
  });

  document.querySelectorAll(".cityBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentCity = btn.dataset.city || "Potes";
      setActiveButtons(".cityBtn", b => b.dataset.city === currentCity);

      if(currentView === "stats") renderStats();
      else if(currentView !== "excusas") render();
    });
  });

  const seen = localStorage.getItem(INTRO_SEEN) === "1";
  const logged = localStorage.getItem(STORAGE_FLAG) === "1";

  if(!seen){
    document.getElementById("intro")?.classList.remove("hidden");
    document.getElementById("gate")?.classList.add("hidden");
    document.getElementById("app")?.classList.add("hidden");
    armIntro();
    return;
  }

  document.getElementById("intro")?.classList.add("hidden");

  if(logged){
    showApp();
    await loadData();
    sortByPrice();
  }else{
    showGate();
  }
});
