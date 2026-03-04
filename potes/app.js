/* ======================
CONFIG
====================== */

// clave "henry"
const SOCIO_KEY_SHA256_HEX =
"927a3aed189d610b2e151c4208913b3ed0cb38f6be613756819b1513c8924d7f";

const STORAGE_FLAG = "potes_socio_ok_v1";
const INTRO_SEEN = "potes_intro_seen_v1";

/* ======================
UTILIDADES
====================== */

async function sha256Hex(str){
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return [...new Uint8Array(buf)]
    .map(b=>b.toString(16).padStart(2,"0"))
    .join("");
}

function euro(n){
  return new Intl.NumberFormat("es-ES",
  {style:"currency",currency:"EUR"}).format(n);
}

function priceClass(price){

  if(price<=2.0) return "p-green";
  if(price<=2.3) return "p-yellow";
  return "p-red";

}

function valueEurPer100ml(item){

  const ml = item.volume_ml || 200;
  return (item.price/ml)*100;

}

/* ======================
STATE
====================== */

let DATA=null;
let view=[];
let currentView="ranking";

/* ======================
INTRO
====================== */

let audioCtx=null;

function beep(freq=880,ms=40,vol=0.03){

  if(!audioCtx) return;

  const o=audioCtx.createOscillator();
  const g=audioCtx.createGain();

  o.type="square";
  o.frequency.value=freq;
  g.gain.value=vol;

  o.connect(g);
  g.connect(audioCtx.destination);

  o.start();

  setTimeout(()=>{o.stop()},ms);

}

function sleep(ms){
  return new Promise(r=>setTimeout(r,ms));
}

async function typeLine(el,text){

  const p=document.createElement("div");
  p.className="introLine";

  el.appendChild(p);

  for(let i=0;i<text.length;i++){

    p.textContent=text.slice(0,i+1);

    beep(880,10,0.02);

    await sleep(20);

  }

}

async function runIntro(){

  const intro=document.getElementById("intro");
  const lines=document.getElementById("introLines");
  const bar=document.getElementById("barInner");
  const pct=document.getElementById("pct");

  lines.innerHTML="";

  const script=[
    "BOOTING POTES.EXE",
    "LOADING DATABASE...",
    "CHECKING BEER QUALITY...",
    "LOADING POTENTIAL HANGOVER...",
    "READY."
  ];

  for(const t of script){

    await typeLine(lines,t);

    await sleep(200);

  }

  for(let i=0;i<=100;i+=2){

    bar.style.width=i+"%";
    pct.textContent=i+"%";

    await sleep(25);

  }

  localStorage.setItem(INTRO_SEEN,"1");

  intro.classList.add("hidden");
  document.getElementById("gate").classList.remove("hidden");

}

function armIntro(){

  const start=async()=>{

    if(!audioCtx){

      try{
        audioCtx=new (window.AudioContext||
        window.webkitAudioContext)();
      }catch(e){}

    }

    await runIntro();

  };

  window.addEventListener("click",start,{once:true});
  window.addEventListener("keydown",e=>{
    if(e.key==="Enter") start();
  },{once:true});

}

/* ======================
DATA
====================== */

async function loadData(){

  const res=await fetch("data.json",{cache:"no-store"});

  DATA=await res.json();

  view=[...DATA.items];

}

/* ======================
RENDER
====================== */

function render(){

  const table=document.getElementById("table");
  const meta=document.getElementById("meta");
  const q=(document.getElementById("q").value||"").toLowerCase();

  let filtered=view;

  if(currentView==="baratos")
    filtered=view.filter(v=>v.price<=2);

  filtered=filtered.filter(it=>{

    if(!q) return true;

    const hay=[
      it.name,
      it.zone,
      it.tapa,
      it.ambiente
    ].join(" ").toLowerCase();

    return hay.includes(q);

  });

  meta.textContent=
  `Actualizado: ${DATA.updated} · ${filtered.length} bares`;

  table.innerHTML=filtered.map((it,idx)=>{

    const pcls=priceClass(it.price);
    const eur100=valueEurPer100ml(it);

    return `

<div class="trow ${(it.price<=2)?"isGreen":""}">

<div class="rank">${idx+1}</div>

<div class="name">
${it.name}
<div class="small">
${it.volume_ml}ml · ${eur100.toFixed(2)}€/100ml
</div>
</div>

<div class="${pcls}">
${euro(it.price)}
</div>

<div class="colHide">
<span class="chip">TAPA: ${it.tapa}</span>
</div>

<div class="colHide">
<span class="chip">AMBIENTE: ${it.ambiente}</span>
</div>

<div class="tags">
<span class="chip">ZONA: ${it.zone}</span>
</div>

</div>

`;

  }).join("");

}

/* ======================
ESTADISTICAS
====================== */

function renderStats(){

  const table=document.getElementById("table");

  const prices=view.map(v=>v.price);

  const avg=prices.reduce((a,b)=>a+b)/prices.length;

  const min=Math.min(...prices);
  const max=Math.max(...prices);

  const cheap=view.find(v=>v.price===min);
  const expensive=view.find(v=>v.price===max);

  table.innerHTML=`

<div class="panel">

<h2>ESTADÍSTICAS</h2>

<p>Precio medio: ${avg.toFixed(2)}€</p>
<p>Más barato: ${cheap.name}</p>
<p>Más caro: ${expensive.name}</p>
<p>Total bares: ${view.length}</p>

</div>

`;

}

/* ======================
SORT
====================== */

function sortByPrice(){

  view.sort((a,b)=>a.price-b.price);

  render();

}

function sortByName(){

  view.sort((a,b)=>a.name.localeCompare(b.name));

  render();

}

/* ======================
LOGIN
====================== */

async function enter(){

  const msg=document.getElementById("gateMsg");

  const key=document.getElementById("key").value;

  const h=await sha256Hex(key);

  if(h!==SOCIO_KEY_SHA256_HEX){

    msg.textContent="Clave incorrecta";

    return;

  }

  localStorage.setItem(STORAGE_FLAG,"1");

  document.getElementById("gate").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");

  await loadData();

  sortByPrice();

}

function logout(){

  localStorage.removeItem(STORAGE_FLAG);

  document.getElementById("app").classList.add("hidden");
  document.getElementById("gate").classList.remove("hidden");

}

/* ======================
INIT
====================== */

window.addEventListener("DOMContentLoaded",async()=>{

  document.getElementById("btnEnter")
  .addEventListener("click",enter);

  document.getElementById("key")
  .addEventListener("keydown",e=>{
    if(e.key==="Enter") enter();
  });

  document.getElementById("btnLogout")
  .addEventListener("click",logout);

  document.getElementById("btnSortPrice")
  .addEventListener("click",sortByPrice);

  document.getElementById("btnSortName")
  .addEventListener("click",sortByName);

  document.getElementById("q")
  .addEventListener("input",render);

  document.querySelectorAll(".navBtn").forEach(btn=>{

    btn.addEventListener("click",()=>{

      currentView=btn.dataset.view;

      if(currentView==="stats")
        renderStats();
      else
        render();

    });

  });

  const seen=localStorage.getItem(INTRO_SEEN);

  if(!seen){

    armIntro();

  }else{

    document.getElementById("intro").classList.add("hidden");
    document.getElementById("gate").classList.remove("hidden");

  }

});
