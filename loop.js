// time calculation
const timeUnit = 1000;  // 1000 -> speed values etc. are "per second"
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
    checks++;
    if (checks > 20) {
        drawFPS = Math.round(checks/((Date.now() - lastCheck)/1000.0));
        lastCheck = Date.now();
        checks = 0;
    }
    cx.font = "40px Arial";
    cx.fillStyle = "black";
    cx.fillText(drawFPS + " fps; "+Math.floor(gameTime/100)+"; "+gameInstance.player.inAir+"; "+gameInstance.player.pos.x, 10, canvas.height-20);

    // -----------------------------------------------------------------------------------------------------------------
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

function update(delta) {
    switch (gameState) {
        case "inGame":
            gameInstance.update(delta);
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