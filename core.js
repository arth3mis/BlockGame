const canvas = document.getElementById("canvas");
const cx = canvas.getContext("2d");

// user settings
const settings = {
    dimension: new AVector(0,0),
    dimensions: [[1920,1080], [1280,720], [800,600]],
    dimensionChoice: 1,
    fullscreen: false,
}
let noBrowserFullscreenExit = false;

const keybindings = {
    toggleSettings: "Tab",
    toggleFullscreen: "f",
}

// canvas setup
let canvasPosition = canvas.getBoundingClientRect();
settings.dimension.set(settings.dimensions[settings.dimensionChoice][0], settings.dimensions[settings.dimensionChoice][1]);
canvas.width = settings.dimension.x;
canvas.height = settings.dimension.y;

const gameStates = {
    inGame: "inGame",
    mainMenu: "mainMenu",
    settingsMenu: "settingsMenu",
}
let gameState = gameStates.inGame;
let prevGameState = gameStates.mainMenu;

let menuInstance;
let gameInstance = new Game();
let settingsInstance;

const mouse = {
    pos: new AVector(0,0),
    lmb: false,
    rmb: false,
    mmb: false,
}
canvas.addEventListener("mousemove", function(e) {
    mouse.pos.set(e.x, e.y);
});

// time calculation
const tickLength = 1000 / 10;
let tickBuffer = 0;
let gameTime = 0;

const timeStep = 1000 / 60;
const panicThreshold = 4 * 1000 / timeStep;
let panicsCount = 0;
let timeLastFrame = 0;
let timeDelta = 0;

// fps
let lastCheck = 0;
let checks = 0;
let drawFPS = 0;

// main loop
function animate(timestamp) {
    // -----------------------------------------------------------------------------------------------------------------

    cx.clearRect(0, 0, canvas.width, canvas.height);

    // update and draw
    timeDelta += timestamp - timeLastFrame;
    let updateCount = 0;
    while (timeDelta >= timeStep) {
        update(timeStep, gameTime);
        timeDelta -= timeStep;
        if (++updateCount >= panicThreshold) {
            panic();
            timeDelta = 0;
            tickBuffer = 0;
            timeLastFrame = timestamp;
            break;
        }
    }
    draw();

    // game time
    tickBuffer += timestamp - timeLastFrame;
    while (tickBuffer > tickLength) {
        gameTime++;
        tickBuffer -= tickLength;
    }

    timeLastFrame = timestamp;

    // todo dev fps
    checks++;
    if (checks > 20) {
        drawFPS = Math.round(checks/((Date.now() - lastCheck)/1000.0));
        lastCheck = Date.now();
        checks = 0;
    }
    cx.font = "40px Arial";
    cx.fillStyle = "black";
    cx.fillText(drawFPS + " fps; "+gameState+"; "+gameTime, 10, canvas.height-20);

    // -----------------------------------------------------------------------------------------------------------------
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

function update(delta, time) {
    switch (gameState) {
        case "inGame":
            gameInstance.update(delta, time);
            break;
    }
}

function draw() {
    switch (gameState) {
        case "inGame":
            gameInstance.draw();
            break;
    }
}

function panic() {
    panicsCount++;
    alert("Timeout - Click OK to continue the game");
}

// universal listeners
window.addEventListener("keydown", function(e) {
    const key = e.key;
    // open/close settings
    if (key === keybindings.toggleSettings) {
        if (gameState === gameStates.settingsMenu) {
            prevGameState = gameState;
            gameState = gameStates.settingsMenu;
        } else {
            gameState = prevGameState;
        }
    }
    // toggle fullscreen
    else if (key === keybindings.toggleFullscreen) {
        settings.fullscreen = !settings.fullscreen;
        noBrowserFullscreenExit = true;
        if (settings.fullscreen) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
});

window.addEventListener("resize", function(e) {
    canvasPosition = canvas.getBoundingClientRect();

    // catch fullscreen exit by Escape button
    if (noBrowserFullscreenExit) {
        noBrowserFullscreenExit = false;
    } else {
        settings.fullscreen = false;
    }
});