// time calculation
const timeUnit = 1000;  // 1000 -> speed values etc. are "per second"
let gameTime = 0;

let timeStep = 1000 / 60;
let panicThreshold = 4 * 1000 / timeStep;
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
    if (gameState === gameStates.inGame && settings.displayFps) {
        checks++;
        if (checks > 20) {
            drawFPS = Math.round(checks/((Date.now() - lastCheck)/1000.0));
            lastCheck = Date.now();
            checks = 0;
        }
        cx.font = "40px Arial";
        cx.fillStyle = "black";
        cx.fillText(/*drawFPS + " fps; "+Math.floor(gameTime/100)+"; "+*/Math.round(gameInstance.player.pos.x*1000)/1000+"", 40, canvas.height-80);
        cx.fillText(/*drawFPS + " fps; "+Math.floor(gameTime/100)+"; "+*/Math.round(gameInstance.player.pos.y*1000)/1000+"", 40, canvas.height-40);

        cx.font = "20px Arial";
        for (let i = 0; i < settings.blocksInHeight; i++) {
            cx.fillText(i+"", 3, (i+1)*blockSize - 7);
        }
        for (let i = 1; i < worldSize.x; i++) {
            cx.fillText(i+"", i * blockSize + 2, canvas.height - 7);
        }
    }

    // -----------------------------------------------------------------------------------------------------------------
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

function update(delta) {
    switch (gameState) {
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
        case "inGame":
            gameInstance.draw();
            break;
        case "settingsMenu":
            gameInstance.draw();
            settingsInstance.draw();
            break;
    }
}

function panic() {
    panicsCount++;
    alert("Timeout - Click OK to continue the game");
}