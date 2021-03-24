const menuInstance = new Menu();
const settingsInstance = new Settings();
let gameInstance;

let gameState = gameStates.mainMenu;
let prevGameState = gameStates.mainMenu;

// todo call initGame from loop if loadGamePrompt
//  load: get confirmation, esp. if a game is already loaded (maybe make 'save current and load new' option) - generate: choose game name (or not?), worldSize etc.
let loadGamePrompt = false;
let gameSaveInput = null;

let lastKeyboardInput;
let waitingForKeyboardInput = false;  // todo hold everything until input done, request method can access input -> lastKeyboardInput (use for key rebinds)

const inventory = {
    show: false,
    // todo item "grabbed" logic here?
}

function initGame(save=null) {
    menuInstance.generatingWorld = true;
    gameInstance = new Game(save);
    menuInstance.generatingWorld = false;
    prevGameState = gameState;
    gameState = gameStates.inGame;
}

const mouse = {
    pos: new AVector(0, 0),
    lmb: false,
    lmbTriggered: false,
    mmb: false,
    rmb: false,
    wheelUp: 0,
    wheelDown: 0,
}
window.addEventListener("mousemove", function(e) {  // window listener to detect mouse out of bounds
    mouse.pos.set(e.x - canvasPosition.left, e.y - canvasPosition.top);
    if (mouse.pos.x < 0 || mouse.pos.y < 0 || mouse.pos.x >= canvas.width - (isOsMac ? 1 : 0) || mouse.pos.y >= canvas.height - (isOsMac ? 1 : 0)) {
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
    if (gameState === gameStates.settingsMenu) {
        if (e.button === 0) {
            mouse.lmbTriggered = true;
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
        disableUserInputs();
    }
});
canvas.addEventListener("wheel", function(e) {
    let d = Math.sign(e.deltaY);
    if (d > 0) mouse.wheelDown++;
    else mouse.wheelUp++;
});

const keybindings = {
    toggleSettings: "t",
    toggleFullscreen: "f",
    loadWorld: "l",
    saveOrGenerateWorld: "enter",
    exitToMenu: "backspace",
    moveUp: "w",
    moveLeft: "a",
    moveDown: "s",
    moveRight: "d",
    jump: " ",
    inventory: "e",
    inventorySlot1: "1",
    inventorySlot2: "2",
    inventorySlot3: "3",
    inventorySlot4: "4",
    inventorySlot5: "5",
    inventorySlot6: "6",
    inventorySlot7: "7",
    inventorySlot8: "8",
    inventorySlot9: "9",
    inventorySlot0: "0",
}

const keyboard = {
    moveUp: false,
    moveLeft: false,
    moveDown: false,
    moveRight: false,
    jump: false,
}
function disableUserInputs() {
    mouse.lmb = false;
    mouse.mmb = false;
    mouse.wheelUp = 0;
    mouse.wheelDown = 0;
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
    key = key.toLowerCase();
    // open/close settings
    if (key === keybindings.toggleSettings) {
        disableUserInputs();
        if (gameState === gameStates.settingsMenu) {
            settingsInstance.setMainPage();
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
    // load world
    else if (key === keybindings.loadWorld && gameState === gameStates.mainMenu) {
        uploadFile();  // further logic in preloadCore.js/uploadFile()
    }
    // save/generate world
    else if (key === keybindings.saveOrGenerateWorld) {
        disableUserInputs();
        if (gameState === gameStates.inGame) {
            downloadFile(gameInstance.saveName + saveFileType, gameInstance.save());
        } else if (gameState === gameStates.mainMenu) {
            initGame();
        }
    }
    // exit to main menu/continue loaded world
    if (key === keybindings.exitToMenu) {
        disableUserInputs();
        if (gameState === gameStates.inGame) {
            prevGameState = gameState;
            gameState = gameStates.mainMenu;
        } else if (gameState === gameStates.mainMenu && gameInstance != null) {
            prevGameState = gameState;
            gameState = gameStates.inGame;
        }
    }
    // control
    if (gameState === gameStates.inGame && gameInstance != null) {
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
        if (key === keybindings.jump && !keyboard.jump) {
            keyboard.jump = true;
            gameInstance.player.jumpsTriggered++;
            gameInstance.player.jumpTriggerNeeded = false;
        }
        if (key === keybindings.inventory) {
            inventory.show = !inventory.show;
        } else {
            switch (key) {
                case keybindings.inventorySlot1: gameInstance.player.hotbarSelection = 0; break;
                case keybindings.inventorySlot2: gameInstance.player.hotbarSelection = 1; break;
                case keybindings.inventorySlot3: gameInstance.player.hotbarSelection = 2; break;
                case keybindings.inventorySlot4: gameInstance.player.hotbarSelection = 3; break;
                case keybindings.inventorySlot5: gameInstance.player.hotbarSelection = 4; break;
                case keybindings.inventorySlot6: gameInstance.player.hotbarSelection = 5; break;
                case keybindings.inventorySlot7: gameInstance.player.hotbarSelection = 6; break;
                case keybindings.inventorySlot8: gameInstance.player.hotbarSelection = 7; break;
                case keybindings.inventorySlot9: gameInstance.player.hotbarSelection = 8; break;
                case keybindings.inventorySlot0: gameInstance.player.hotbarSelection = 9; break;
            }
        }
    }
}
function keydown(e) {
    handleKeyDown(e.key);
}
window.addEventListener("keydown", keydown);

function handleKeyUp(key) {
    key = key.toLowerCase();
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