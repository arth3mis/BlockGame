const menuInstance = new Menu();
const settingsInstance = new Settings();
let gameInstance = new Game();

const gameStates = {
    inGame: "inGame",
    mainMenu: "mainMenu",
    settingsMenu: "settingsMenu",
}
let gameState = gameStates.inGame;
let prevGameState = gameStates.mainMenu;

const mouse = {
    pos: new AVector(0, 0),
    lmb: false,
    lmbTriggered: false, lmbTriggerPos: new AVector(0, 0),
    mmb: false,
    rmb: false,
}
window.addEventListener("mousemove", function(e) {  // window listener to detect mouse out of bounds
    mouse.pos.set(e.x - canvasPosition.left, e.y - canvasPosition.top);
    if (mouse.pos.x < 0 || mouse.pos.y < 0 || mouse.pos.x >= canvas.width || mouse.pos.y >= canvas.height) {
        mouse.lmb = false;
        mouse.mmb = false;
        mouse.rmb = false;
    }
});
canvas.addEventListener("mousedown", function(e) {
    if (e.button === 0) {
        mouse.lmb = true;
    } else if (e.button === 1) {
        mouse.mmb = true;
    } else if (e.button === 2) {
        mouse.rmb = true;
    }
    if (gameState !== gameStates.inGame) {
        if (e.button === 0) {
            mouse.lmbTriggered = true;
            mouse.lmbTriggerPos = new AVector(e.x - canvasPosition.left, e.y - canvasPosition.top);
        }
    }
});
canvas.addEventListener("mouseup", function(e) {
    if (e.button === 0 && mouse.lmb) {
        mouse.lmb = false;
    } else if (e.button === 1 && mouse.mmb) {
        mouse.mmb = false;
    } else if (e.button === 2 && mouse.rmb) {
        mouse.rmb = false;
        disableKeyboardPresses();
    }
});

const keybindings = {
    toggleSettings: "t",
    toggleFullscreen: "f",
    moveUp: "w",
    moveLeft: "a",
    moveDown: "s",
    moveRight: "d",
    jump: " ",
}

const keyboard = {
    moveUp: false,
    moveLeft: false,
    moveDown: false,
    moveRight: false,
    jump: false,
}
function disableKeyboardPresses() {
    if (keyboard.moveUp)
        handleKeyUp(keybindings.moveUp);
    if (keyboard.moveLeft)
        handleKeyUp(keybindings.moveLeft);
    if (keyboard.moveDown)
        handleKeyUp(keybindings.moveDown);
    if (keyboard.moveRight)
        handleKeyUp(keybindings.moveRight);
    if (keyboard.jump)
        handleKeyUp(keybindings.jump);
}

function handleKeyDown(key) {
    // open/close settings
    if (key === keybindings.toggleSettings) {
        if (gameState === gameStates.settingsMenu) {
            settingsInstance.setMainPage();
            gameState = prevGameState;
        } else {
            if (gameState === gameStates.inGame)
                disableKeyboardPresses();
            prevGameState = gameState;
            gameState = gameStates.settingsMenu;
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
    // control
    if (gameState === gameStates.inGame) {
        if (key === keybindings.moveUp && !keyboard.moveUp) {
            keyboard.moveUp = true;
        }
        if (key === keybindings.moveLeft && !keyboard.moveLeft) {
            keyboard.moveLeft = true;
            gameInstance.player.acc.sub(gameInstance.player.accLR,0);
        }
        if (key === keybindings.moveDown && !keyboard.moveDown) {
            keyboard.moveDown = true;
        }
        if (key === keybindings.moveRight && !keyboard.moveRight) {
            keyboard.moveRight = true;
            gameInstance.player.acc.add(gameInstance.player.accLR,0);
        }
        if (key === keybindings.jump) {
            if (!keyboard.jump && !gameInstance.player.jumped &&
                (!gameInstance.player.inAir || gameTime - gameInstance.player.inAirStart < gameInstance.player.inAirJumpDelay)) {
                gameInstance.player.jumpTime = gameTime;
                gameInstance.player.jumped = true;
                gameInstance.player.jumping = true;
                if (!gameInstance.player.firstJumped) {
                    gameInstance.player.firstJumped = true;
                }
            }
            keyboard.jump = true;
        }
    }
}
function keydown(e) {
    handleKeyDown(e.key);
}
window.addEventListener("keydown", keydown);

function handleKeyUp(key) {
    // control
    if (gameState === gameStates.inGame) {
        if (key === keybindings.moveUp && keyboard.moveUp) {
            keyboard.moveUp = false;
        }
        if (key === keybindings.moveLeft && keyboard.moveLeft) {
            keyboard.moveLeft = false;
            gameInstance.player.acc.add(gameInstance.player.accLR,0);
        }
        if (key === keybindings.moveDown && keyboard.moveDown) {
            keyboard.moveDown = false;
        }
        if (key === keybindings.moveRight && keyboard.moveRight) {
            keyboard.moveRight = false;
            gameInstance.player.acc.sub(gameInstance.player.accLR,0);
        }
        if (key === keybindings.jump && keyboard.jump) {
            keyboard.jump = false;
            gameInstance.player.jumping = false;
        }
    }
}
function keyup(e) {
    handleKeyUp(e.key);
}
window.addEventListener("keyup", keyup);

window.addEventListener("resize", function() {
    canvasPosition = canvas.getBoundingClientRect();

    // catch fullscreen exit by Escape button
    if (noBrowserFullscreenExit) {
        noBrowserFullscreenExit = false;
    } else {
        settings.fullscreen = false;
    }
});