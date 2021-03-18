// time calculation
let gameTime = 0;

let timeStep = 1000 / 60;
let panicThreshold = 4 * 1000 / timeStep;  // panics if 4*60 updates are queued
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
        update(timeStep);
        timeDelta -= timeStep;
        if (++updateCount >= panicThreshold) {
            panic();
            timeDelta = 0;
            timeLastFrame = timestamp;
            break;
        }
    }
    draw();

    // game time
    gameTime += timestamp - timeLastFrame;
    //tickBuffer += timestamp - timeLastFrame;
    //while (tickBuffer > tickLength) {
    //    gameTime++;
    //    tickBuffer -= tickLength;
    //}

    timeLastFrame = timestamp;

    // todo dev fps
    if (settings.displayFps) {
        checks++;
        if (checks > 20) {
            drawFPS = Math.round(checks/((Date.now() - lastCheck)/1000.0));
            lastCheck = Date.now();
            checks = 0;
        }
        cx.textAlign = "left";
        cx.textBaseline = "bottom";
        cx.font = sc(40) + "px Arial";
        cx.fillStyle = "black";
        cx.fillText(drawFPS + " fps; "+Math.floor(gameTime/100)+"; "+Math.round(blockSize*100)/100
            +"; "+(gameInstance != null ? Math.round(gameInstance.world.day*100)/100 : "-")
            , sc(20), canvas.height - sc(20));
    }

    // -----------------------------------------------------------------------------------------------------------------
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

function update(delta) {
    switch (gameState) {
        case "mainMenu":
            menuInstance.update(delta);
            break;
        case "inGame":
            gameInstance.update(delta);
            break;
        case "settingsMenu":
            settingsInstance.update(delta);
            break;
    }
}

function draw() {
    switch (gameState) {
        case "mainMenu":
            menuInstance.draw();
            break;
        case "inGame":
            gameInstance.draw();
            break;
        case "settingsMenu":
            if (prevGameState === gameStates.inGame) {
                gameInstance.draw();
                settingsInstance.draw();
            } else if (prevGameState === gameStates.mainMenu) {
                menuInstance.draw();
                settingsInstance.draw(true);
            }
            break;
    }
}

function panic() {
    panicsCount++;
    alert("Timeout - Click OK to continue the game");
}