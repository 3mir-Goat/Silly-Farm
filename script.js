let currentSlot = 1
let gameMode = "single"

let farmSize = 3

let totalTiles = 3

let money = 5
let seeds = 0

let soundOn = true

let tiles = []

let currentMenu = "none"



/* SCREEN SWITCHING */

function showScreen(id){

// remember which non-game screen we're on
localStorage.setItem("currentScreen", id)

document.querySelectorAll(".screen").forEach(s=>{
    s.classList.add("hidden")
})

document.getElementById("farmScreen").classList.add("hidden")

document.getElementById("sideMenu").classList.add("hidden")

document.getElementById(id).classList.remove("hidden")

}



/* GAME MODE */

function startMode(mode){

gameMode = mode
showScreen("saveMenu")

}



/* SAVE SYSTEM */

function saveGame(){

let data = {
money,
seeds,
tiles,
totalTiles
}

localStorage.setItem("save"+currentSlot, JSON.stringify(data))

}


function clearAllSaves(){

localStorage.removeItem("save1")
localStorage.removeItem("save2")
localStorage.removeItem("save3")

// Optionally, show a message or refresh the menu
alert("All saves cleared!")

}


function loadSave(slot){

currentSlot = slot

// mark this slot as current and record that we're in-game
localStorage.setItem("currentSlot", slot)
localStorage.setItem("inGame", "1")

let data = localStorage.getItem("save"+slot)

if(data){

let save = JSON.parse(data)

money = save.money || 5
seeds = save.seeds || 0
tiles = save.tiles
totalTiles = save.totalTiles || 3

}else{

tiles = []
totalTiles = 3

}

startGame()

}


function exitGame(){

saveGame()

// leaving the farm so clear inGame flag
localStorage.setItem("inGame", "0")

document.getElementById("sideMenu").classList.add("hidden")

showScreen("mainMenu")

}



/* START GAME */

function startGame(){

document.querySelectorAll(".screen").forEach(s=>s.classList.add("hidden"))

document.getElementById("farmScreen").classList.remove("hidden")

document.getElementById("sideMenu").classList.remove("hidden")

document.getElementById("sideContent").innerHTML=""

createFarm()

}



/* FARM */

function createFarm(){

const farm = document.getElementById("farm")

farm.innerHTML=""

for(let i=0;i<totalTiles;i++){

let tile = document.createElement("div")

tile.classList.add("tile")

if(!tiles[i]) tiles[i]={state:"empty"}

updateTile(tile,i)

tile.onclick = ()=>interactTile(tile,i)

farm.appendChild(tile)

}

}



function updateTile(tile,index){

let state = tiles[index].state

tile.className="tile"

if(state==="growing") tile.classList.add("growing")

if(state==="ready") tile.classList.add("ready")

}



/* TILE INTERACTION */

function interactTile(tile,index){

let state = tiles[index].state

if(state==="empty"){

if(seeds<=0) return

seeds--

tiles[index].state="growing"

updateTile(tile,index)

refreshMenu()

setTimeout(()=>{

tiles[index].state="ready"
updateTile(tile,index)

},5000)

}

else if(state==="ready"){

tiles[index].state="empty"

money += 10

updateTile(tile,index)

refreshMenu()

}

saveGame()

}



/* MENU REFRESH */

function refreshMenu(){

if(currentMenu==="shop") openShop()
if(currentMenu==="stats") showStats()

}



/* SHOP */

function openShop(){

currentMenu="shop"

let buttonText = "Add Tile"
let costText = ""
let upgradesDone = totalTiles - 3
if(upgradesDone < upgradeCosts.length){
 let cost = upgradeCosts[upgradesDone]
 costText = ` ($${cost})`
} else {
 costText = " (MAX)"
}

document.getElementById("sideContent").innerHTML=

`
<h4>Shop</h4>

Money: $${money}<br>
Seeds: ${seeds}<br><br>

<button onclick="buySeed()">Buy Seed ($5)</button>
<button onclick="upgradeFarm()">${buttonText}${costText}</button>
`

}


function buySeed(){

if(money>=5){

money-=5
seeds++

openShop()

}

}



/* FARM UPGRADES */

// cost schedule for each upgrade (1st purchase = 4th tile overall)
const upgradeCosts = [
  30,  // 1st tile (total 4)
  50,  // 2nd tile
  80, // 3rd tile
  120,
  150,
  200,
  300,
  400,
  500,
  600,
  750,
  1000 // 12th purchase (total 15)
];
// upgradeCosts[index] gives price for the (index+1)th purchase


function upgradeFarm(){

let upgradesDone = totalTiles - 3; // number already bought
if(upgradesDone >= upgradeCosts.length) return

let cost = upgradeCosts[upgradesDone]
if(money < cost) return

money -= cost

totalTiles++

createFarm()

openShop()

}



/* STATS */

function showStats(){

currentMenu="stats"

let tileInfo = `${totalTiles} tiles`
if(totalTiles>=15) tileInfo += " (MAX)"

document.getElementById("sideContent").innerHTML=

`
<h4>Stats</h4>

Money: $${money}<br>
Seeds: ${seeds}<br>
Tile count: ${tileInfo}

`

}



/* SETTINGS */

function openSettings(){

currentMenu="settings"

document.getElementById("sideContent").innerHTML=

`
<h4>Settings</h4>

<button onclick="toggleSound()">Sound: ${soundOn?"ON":"OFF"}</button>

<br><br>

<button onclick="exitGame()">Exit Game</button>
`

}



/* SOUND */

function toggleSound(){

soundOn=!soundOn

openSettings()

}



/* START MENU */

// auto-save when the user closes or reloads the page
window.addEventListener('beforeunload', saveGame)

// restore if we were already playing
let resumedSlot = localStorage.getItem("currentSlot")
let wasInGame = localStorage.getItem("inGame") === "1"
if(resumedSlot && wasInGame){
    loadSave(parseInt(resumedSlot,10))
} else {
    let screen = localStorage.getItem("currentScreen") || "mainMenu"
    showScreen(screen)
}