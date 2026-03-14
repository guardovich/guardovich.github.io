let players = [];
let scores = {};
let currentPlayer = 0;

let dice = [1,1,1,1,1];
let locked = [false,false,false,false,false];

let rollsLeft = 3;

function startGame(){

let num = document.getElementById("numPlayers").value;

players = [];

for(let i=1;i<=num;i++){
players.push("Jugador "+i);
}

players.forEach(p=>{
scores[p]={};
});

document.getElementById("setup").style.display="none";
document.getElementById("game").style.display="block";

updateTurn();
createScoreTable();
renderDice();
}

function updateTurn(){
document.getElementById("turnInfo").innerText=
"Turno de "+players[currentPlayer];
}

function rollDice(){

if(rollsLeft===0)return;

for(let i=0;i<5;i++){
if(!locked[i]){
dice[i]=Math.floor(Math.random()*6)+1;
}
}

rollsLeft--;

document.getElementById("rollsLeft").innerText=rollsLeft;

renderDice();
}

function renderDice(){

let area=document.getElementById("diceArea");
area.innerHTML="";

dice.forEach((d,i)=>{

let div=document.createElement("div");

div.className="die";
if(locked[i])div.classList.add("locked");

div.innerText=d;

div.onclick=()=>{
locked[i]=!locked[i];
renderDice();
}

area.appendChild(div);

});

}

function endTurn(){

let player=players[currentPlayer];

let score=calculateScore();

scores[player]["turn"+Object.keys(scores[player]).length]=score;

currentPlayer++;

if(currentPlayer>=players.length){
currentPlayer=0;
}

resetTurn();

createScoreTable();

updateTurn();
}

function resetTurn(){

rollsLeft=3;

locked=[false,false,false,false,false];

document.getElementById("rollsLeft").innerText=rollsLeft;

dice=[1,1,1,1,1];

renderDice();

}

function calculateScore(){

let counts=[0,0,0,0,0,0];

dice.forEach(d=>{
counts[d-1]++;
});

let values=Object.values(counts);

if(values.includes(5))return 50;

if(values.includes(4))return 40;

if(values.includes(3) && values.includes(2))return 30;

if(values.includes(3))return 20;

let sorted=[...dice].sort();

if(JSON.stringify(sorted)==JSON.stringify([1,2,3,4,5])||
JSON.stringify(sorted)==JSON.stringify([2,3,4,5,6])){
return 25;
}

return dice.reduce((a,b)=>a+b);
}

function createScoreTable(){

let table=document.getElementById("scoreTable");

table.innerHTML="";

let header="<tr>";

players.forEach(p=>{
header+="<th>"+p+"</th>";
});

header+="</tr>";

table.innerHTML+=header;

let maxTurns=10;

for(let i=0;i<maxTurns;i++){

let row="<tr>";

players.forEach(p=>{

let val=scores[p]["turn"+i]||"";

row+="<td>"+val+"</td>";

});

row+="</tr>";

table.innerHTML+=row;

}

}a
