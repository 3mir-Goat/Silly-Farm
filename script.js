let currentSlot = 1
let gameMode = "single"
let totalTiles = 3
let money = 0.2
let wheat_seeds = 0
let corn_seeds = 0
let carrot_seeds = 0
let potato_seeds = 0
let wheat = 0
let corn = 0
let carrot = 0
let potato = 0
let soundOn = true
let tiles = []
let currentMenu = "none"
let farmSize = 3

/* MONEY FORMATTING */

function formatMoney(amount) {
    return amount.toFixed(1)
}

/* SCREEN SWITCHING */

function showScreen(id) {
    sessionStorage.setItem("currentScreen", id)
    document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"))
    document.getElementById("farmScreen").classList.add("hidden")
    document.getElementById("sideMenu").classList.add("hidden")
    document.getElementById(id).classList.remove("hidden")
}

/* GAME MODE */

function startMode(mode) {
    gameMode = mode
    showScreen("saveMenu")
}

/* SAVE SYSTEM */

function saveGame() {
    const data = {
        money, wheat_seeds, corn_seeds, carrot_seeds, potato_seeds,
        wheat, corn, carrot, potato, tiles, totalTiles
    }
    localStorage.setItem("save" + currentSlot, JSON.stringify(data))
}

function clearAllSaves() {
    localStorage.removeItem("save1")
    localStorage.removeItem("save2")
    localStorage.removeItem("save3")
    alert("All saves cleared!")
}

function loadSave(slot) {
    currentSlot = slot
    sessionStorage.setItem("currentSlot", slot)
    sessionStorage.setItem("inGame", "1")
    const data = localStorage.getItem("save" + slot)
    if (data) {
        const save = JSON.parse(data)
        money = save.money ?? 0.2
        wheat_seeds = save.wheat_seeds ?? 1
        corn_seeds = save.corn_seeds ?? 0
        carrot_seeds = save.carrot_seeds ?? 0
        potato_seeds = save.potato_seeds ?? 0
        wheat = save.wheat ?? 0
        corn = save.corn ?? 0
        carrot = save.carrot ?? 0
        potato = save.potato ?? 0
        tiles = save.tiles ?? []
        totalTiles = save.totalTiles ?? 3
    } else {
        money = 0.2
        wheat_seeds = 1
        corn_seeds = carrot_seeds = potato_seeds = 0
        wheat = corn = carrot = potato = 0
        tiles = []
        totalTiles = 3
    }
    startGame()
}

function exitGame() {
    saveGame()
    sessionStorage.setItem("inGame", "0")
    document.getElementById("sideMenu").classList.add("hidden")
    showScreen("mainMenu")
}

/* START GAME */

function startGame() {
    document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"))
    document.getElementById("farmScreen").classList.remove("hidden")
    document.getElementById("sideMenu").classList.remove("hidden")
    document.getElementById("sideContent").innerHTML = ""
    createFarm()
}

/* FARM */

function createFarm() {
    const farm = document.getElementById("farm")
    farm.innerHTML = ""
    for (let i = 0; i < totalTiles; i++) {
        const tile = document.createElement("div")
        tile.classList.add("tile")
        if (!tiles[i]) tiles[i] = { state: "empty" }
        updateTile(tile, i)
        tile.onclick = () => interactTile(tile, i)
        farm.appendChild(tile)
        if (tiles[i].state === "growing" && tiles[i].plantedAt) {
            const elapsed = Date.now() - tiles[i].plantedAt
            const growTime = getCropGrowTime(tiles[i].cropType)
            if (elapsed >= growTime) {
                tiles[i].state = "ready"
                updateTile(tile, i)
            } else {
                setTimeout(() => {
                    tiles[i].state = "ready"
                    updateTile(tile, i)
                }, growTime - elapsed)
            }
        }
    }
}

function updateTile(tile, index) {
    const state = tiles[index].state
    tile.className = "tile"
    if (state === "growing") {
        tile.classList.add("growing")
        const cropType = tiles[index].cropType
        if (cropType === "wheat") tile.textContent = "🌾"
        else if (cropType === "corn") tile.textContent = "🌽"
        else if (cropType === "carrot") tile.textContent = "🥕"
        else if (cropType === "potato") tile.textContent = "🥔"
    }
    if (state === "ready") {
        tile.classList.add("ready")
        const cropType = tiles[index].cropType
        if (cropType === "wheat") tile.textContent = "🌾"
        else if (cropType === "corn") tile.textContent = "🌽"
        else if (cropType === "carrot") tile.textContent = "🥕"
        else if (cropType === "potato") tile.textContent = "🥔"
    }
}

/* CROP DATA */

const CROPS = {
    wheat: { growTime: 5000, cost: 0.2, sell: 0.5 },
    corn: { growTime: 10000, cost: 7.5, sell: 15 },
    carrot: { growTime: 15000, cost: 75, sell: 150 },
    potato: { growTime: 20000, cost: 1000, sell: 2000 }
}

function getCropGrowTime(cropType) {
    return CROPS[cropType]?.growTime || 5000
}

function getCropCost(cropType) {
    return CROPS[cropType]?.cost || 0
}

function getCropSellPrice(cropType) {
    return CROPS[cropType]?.sell || 0
}

function getCropCount(cropType) {
    if (cropType === "wheat") return wheat
    if (cropType === "corn") return corn
    if (cropType === "carrot") return carrot
    if (cropType === "potato") return potato
    return 0
}

function setCropCount(cropType, amount) {
    if (cropType === "wheat") wheat = amount
    else if (cropType === "corn") corn = amount
    else if (cropType === "carrot") carrot = amount
    else if (cropType === "potato") potato = amount
}

function getSeedCount(cropType) {
    if (cropType === "wheat") return wheat_seeds
    if (cropType === "corn") return corn_seeds
    if (cropType === "carrot") return carrot_seeds
    if (cropType === "potato") return potato_seeds
    return 0
}

function setSeedCount(cropType, amount) {
    if (cropType === "wheat") wheat_seeds = amount
    else if (cropType === "corn") corn_seeds = amount
    else if (cropType === "carrot") carrot_seeds = amount
    else if (cropType === "potato") potato_seeds = amount
}

/* TILE INTERACTION */

function interactTile(tile, index) {
    let state = tiles[index].state
    if (state === "empty") {
        currentMenu = "plantSelect"
        let html = `<h4>Plant Seed</h4>`
        for (let cropType in CROPS) {
            let count = getSeedCount(cropType)
            html += `<button onclick="plantCrop('${cropType}', ${index})">${cropType.charAt(0).toUpperCase() + cropType.slice(1)} Seeds (${count})</button><br>`
        }
        document.getElementById("sideContent").innerHTML = html
    } else if (state === "ready") {
        let cropType = tiles[index].cropType
        tiles[index].state = "empty"
        delete tiles[index].plantedAt
        delete tiles[index].cropType
        let newCount = getCropCount(cropType) + 1
        setCropCount(cropType, newCount)
        createFarm()
        refreshMenu()
    }
    saveGame()
}

function plantCrop(cropType, tileIndex) {
    const count = getSeedCount(cropType)
    if (count <= 0) return
    
    setSeedCount(cropType, count - 1)
    
    tiles[tileIndex].state = "growing"
    tiles[tileIndex].cropType = cropType
    tiles[tileIndex].plantedAt = Date.now()
    
    const growTime = getCropGrowTime(cropType)
    const tile = document.querySelector(`#farm .tile:nth-child(${tileIndex + 1})`)
    updateTile(tile, tileIndex)
    
    // Refresh immediately after planting for smoother experience
    if (currentMenu === "plantSelect") {
        // Update the plant selection menu to show new seed counts
        currentMenu = "plantSelect" // Keep it as plantSelect
        let html = `<h4>Plant Seed</h4>`
        for (const cropType in CROPS) {
            const count = getSeedCount(cropType)
            html += `<button onclick="plantCrop('${cropType}', ${tileIndex})">${cropType.charAt(0).toUpperCase() + cropType.slice(1)} Seeds (${count})</button><br>`
        }
        document.getElementById("sideContent").innerHTML = html
    } else {
        refreshMenu()
    }
    
    setTimeout(() => {
        tiles[tileIndex].state = "ready"
        updateTile(tile, tileIndex)
    }, growTime)
    
    saveGame()
}

function refreshMenu() {
    if (currentMenu === "shop") openShop()
    if (currentMenu === "stats") showStats()
    if (currentMenu === "crops") showCrops()
    if (currentMenu === "market") openMarket()
    if (currentMenu === "plantSelect") {}
}

function openShop() {
    currentMenu = "shop"
    const buttonText = "Add Tile"
    let costText = ""
    const upgradesDone = totalTiles - 3
    if (upgradesDone < upgradeCosts.length) {
        const cost = upgradeCosts[upgradesDone]
        costText = ` ($${formatMoney(cost)})`
    } else {
        costText = " (MAX)"
    }
    let html = `<h4>Shop</h4>Money: $${formatMoney(money)}<br><br>`
    for (const cropType in CROPS) {
        const cost = getCropCost(cropType)
        const display = cropType.charAt(0).toUpperCase() + cropType.slice(1)
        html += `<button onclick="buySeed('${cropType}')">${display} Seed ($${formatMoney(cost)})</button><br>`
    }
    html += `<br><button onclick="upgradeFarm()">${buttonText}${costText}</button>`
    document.getElementById("sideContent").innerHTML = html
}

function buySeed(cropType) {
    const cost = getCropCost(cropType)
    if (money >= cost) {
        money -= cost
        const count = getSeedCount(cropType)
        setSeedCount(cropType, count + 1)
        openShop()
        saveGame()
    }
}

const upgradeCosts = [50, 100, 200, 300, 500, 750, 1000, 1500, 2500, 4000, 6000, 10000]

function upgradeFarm() {
    const upgradesDone = totalTiles - 3
    if (upgradesDone >= upgradeCosts.length) return
    const cost = upgradeCosts[upgradesDone]
    if (money < cost) return
    money -= cost
    totalTiles++
    createFarm()
    openShop()
}

function showCrops() {
    currentMenu = "crops"
    let html = `<h4>Crops</h4>`
    for (const cropType in CROPS) {
        const count = getCropCount(cropType)
        const price = getCropSellPrice(cropType)
        const display = cropType.charAt(0).toUpperCase() + cropType.slice(1)
        html += `${display}: ${count}<br>`
        if (count > 0) {
            html += `<button onclick="sellCrop('${cropType}')">Sell for $${formatMoney(price)}</button><br>`
        }
    }
    document.getElementById("sideContent").innerHTML = html
}

function sellCrop(cropType) {
    const count = getCropCount(cropType)
    if (count <= 0) return
    const price = getCropSellPrice(cropType)
    money += price
    setCropCount(cropType, count - 1)
    refreshMenu()
    saveGame()
}

function showStats() {
    currentMenu = "stats"
    let tileInfo = `${totalTiles} tiles`
    if (totalTiles >= 15) tileInfo += " (MAX)"
    document.getElementById("sideContent").innerHTML = `
<h4>Stats</h4>
Money: $${formatMoney(money)}<br>
Tile count: ${tileInfo}
`
}

function openSettings() {
    currentMenu = "settings"
    document.getElementById("sideContent").innerHTML = `
<h4>Settings</h4>
<button onclick="toggleSound()">Sound: ${soundOn ? "ON" : "OFF"}</button>
<br><br>
<button onclick="exitGame()">Exit Game</button>
`
}

function toggleSound() {
    soundOn = !soundOn
    openSettings()
}

/* MARKET */

function openMarket() {
    currentMenu = "market"
    let html = `<h4>Market</h4>`
    html += `<p>Money: $${formatMoney(money)}</p><br>`
    
    let hasCrops = false
    for (let cropType in CROPS) {
        let count = getCropCount(cropType)
        let price = getCropSellPrice(cropType)
        let display = cropType.charAt(0).toUpperCase() + cropType.slice(1)
        
        if (count > 0) {
            hasCrops = true
            html += `<div style="margin: 10px 0;">`
            html += `${display}: ${count} units<br>`
            html += `<button onclick="sellCrop('${cropType}')">Sell for $${formatMoney(price)}</button>`
            html += `</div>`
        }
    }
    
    if (!hasCrops) {
        html += `<p>No crops available to sell. Harvest some crops first!</p>`
    }
    
    document.getElementById("sideContent").innerHTML = html
}

function openRefinery() {
    currentMenu = "refinery"
    document.getElementById("sideContent").innerHTML = `
<h4>Refinery</h4>
<p>Not yet implemented</p>
`
}



/* START MENU */

// auto-save when the user closes or reloads the page
window.addEventListener('beforeunload', saveGame)

// restore if we were already playing
let resumedSlot = sessionStorage.getItem("currentSlot")
let wasInGame = sessionStorage.getItem("inGame") === "1"
if (resumedSlot && wasInGame) {
    loadSave(parseInt(resumedSlot, 10))
} else {
    let screen = sessionStorage.getItem("currentScreen") || "mainMenu"
    showScreen(screen)
}
