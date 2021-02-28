const canvas = document.getElementById("canvas");
const cx = canvas.getContext("2d");

// user settings
const settings = {
    dimension: new AVector(0,0),
    dimensions: [[1920,1080], [1280,720], [800,600]],
    dimensionChoice: 1,
    fullscreen: false,
    frameLimit: 60,
}

const keybindings = {
    toggleSettings: "Tab",
    toggleFullscreen: "f",
}

// set size
settings.dimension.set(settings.dimensions[settings.dimensionChoice][0], settings.dimensions[settings.dimensionChoice][1]);
canvas.width = settings.dimension.x;
canvas.height = settings.dimension.y;

const gameStates = {
    inGame: "inGame",
    mainMenu: "mainMenu",
    settingsMenu: "settingsMenu",
}
let gameState = gameStates.mainMenu;
let prevGameState = gameStates.mainMenu;

const mouse = {
    pos: new AVector(0,0),
    lmb: false,
    rmb: false,
    mmb: false,
}
canvas.addEventListener("mousemove", function(e) {
    mouse.set(e.x, e.y);
});

// main loop
function animate() {


    requestAnimationFrame(animate);
}
animate();

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
        if (settings.fullscreen) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
});

window.addEventListener("resize", function(e) {
    // catch escape button press from fullscreen
    if (settings.fullscreen) {
        settings.fullscreen = false;
    }
});