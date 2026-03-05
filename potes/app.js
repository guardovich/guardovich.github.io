const STORAGE="potes_login"

let DATA=null
let view=[]

function cucasScore(b){

let score=50

if(b.price<=2)score+=20
else if(b.price<=2.3)score+=10
else score-=5

score+= (b.pros?.length||0)*6
score-= (b.cons?.length||0)*8

if(b.ambiente?.toLowerCase()=="barrio")score+=6
if(b.ambiente?.toLowerCase()=="turístico")score-=4

if(b.tapa && b.tapa!="—")score+=4

score=Math.max(0,Math.min(100,score))

return score

}

async function loadData(){

const r=await fetch("data.json")
DATA=await r.json()
view=[...DATA.items]

render()

}

function render(){

const table=document.getElementById("table")

table.innerHTML=view.map((b,i)=>{

const score=cucasScore(b)

const pros=(b.pros||[]).map(x=>`<span class="pro">👍 ${x}</span>`).join("")
const cons=(b.cons||[]).map(x=>`<span class="con">👎 ${x}</span>`).join("")

return `

<div class="trow">

<div class="rank">${i+1}</div>

<div class="name">

${b.name}

<div class="small">${b.zone} · ${b.ambiente}</div>

${pros}${cons}

<div class="cucasWrap">

CUCAS SCORE ${score}

<div class="cucasBarOuter">

<div class="cucasBarInner" style="width:${score}%"></div>

</div>

</div>

</div>

<div class="price">${b.price}€</div>

</div>

`

}).join("")

}

function sortPrice(){
view.sort((a,b)=>a.price-b.price)
render()
}

function sortName(){
view.sort((a,b)=>a.name.localeCompare(b.name))
render()
}

function sortCucas(){
view.sort((a,b)=>cucasScore(b)-cucasScore(a))
render()
}

function generarRuta(){

const bares=[...view]

bares.sort(()=>Math.random()-0.5)

const ruta=bares.slice(0,3)

let texto="Ruta recomendada: "

ruta.forEach((b,i)=>{

if(i==0)texto+=`empezamos en <span>${b.name}</span>`
else if(i==1)texto+=` luego vamos a <span>${b.name}</span>`
else texto+=` y terminamos en <span>${b.name}</span>`

const pro=b.pros?.[0]
const con=b.cons?.[0]

if(pro)texto+=` porque ${pro.toLowerCase()}`
if(con)texto+=` (aunque ${con.toLowerCase()})`

texto+=". "

})

document.getElementById("rutaPotes").innerHTML=texto

}

function enter(){

const k=document.getElementById("key").value

if(k==="henry"){

localStorage.setItem(STORAGE,"1")

document.getElementById("gate").classList.add("hidden")
document.getElementById("app").classList.remove("hidden")

loadData()

}

}

function logout(){

localStorage.removeItem(STORAGE)
location.reload()

}

document.addEventListener("DOMContentLoaded",()=>{

document.getElementById("btnEnter").onclick=enter
document.getElementById("btnLogout").onclick=logout

document.getElementById("btnSortPrice").onclick=sortPrice
document.getElementById("btnSortName").onclick=sortName
document.getElementById("btnSortCucas").onclick=sortCucas

document.getElementById("btnRuta").onclick=generarRuta

if(localStorage.getItem(STORAGE)){
document.getElementById("gate").classList.add("hidden")
document.getElementById("app").classList.remove("hidden")
loadData()
}

})
