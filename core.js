let menuInstance;
let gameInstance = new Game();
let settingsInstance;

const gameStates = {
    inGame: "inGame",
    mainMenu: "mainMenu",
    settingsMenu: "settingsMenu",
}
let gameState = gameStates.inGame;
let prevGameState = gameStates.mainMenu;

const mouse = {
    pos: new AVector(0,0),
    lmb: false,
    rmb: false,
    mmb: false,
}
canvas.addEventListener("mousemove", function(e) {
    mouse.pos.set(e.x, e.y);
});
canvas.addEventListener("mousedown", function(e) {
    if (e.button === 0) {
        mouse.lmb = true;
    } else if (e.button === 1) {
        mouse.mmb = true;
    } else if (e.button === 2) {
        mouse.rmb = true;
    }
});
canvas.addEventListener("mouseup", function(e) {
    if (e.button === 0) {
        mouse.lmb = false;
    } else if (e.button === 1) {
        mouse.mmb = false;
    } else if (e.button === 2) {
        mouse.rmb = false;
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
window.addEventListener("keydown", function(e) {
    const key = e.key;
    // open/close settings
    if (key === keybindings.toggleSettings) {
        if (gameState === gameStates.settingsMenu) {
            gameState = prevGameState;
        } else {
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
            if (!keyboard.jump && !gameInstance.player.jumped && !gameInstance.player.inAir) {
                gameInstance.player.vel.add(0, gameInstance.player.jumpVel);
                gameInstance.player.jumped = true;
                gameInstance.player.inAir = true;
            }
            keyboard.jump = true;
        }
    }
});

window.addEventListener("keyup", function(e) {
    let key = e.key;
    // control
    if (gameState === gameStates.inGame) {
        if (key === keybindings.moveUp) {
            keyboard.moveUp = false;
        }
        if (key === keybindings.moveLeft) {
            keyboard.moveLeft = false;
            gameInstance.player.acc.add(gameInstance.player.accLR,0);
        }
        if (key === keybindings.moveDown) {
            keyboard.moveDown = false;
        }
        if (key === keybindings.moveRight) {
            keyboard.moveRight = false;
            gameInstance.player.acc.sub(gameInstance.player.accLR,0);
        }
        if (key === keybindings.jump) {
            keyboard.jump = false;
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