class Menu {
    constructor() {
        this.background = new Image();
        this.background.src = resPath + gameStates.mainMenu + "/background" + resFileType;

        this.generatingWorld = false;

        this.titlePos = new AVector(550, 190);
        this.titleStroke = 3.1;
        this.titleStrokeSpeed = 1;
        this.titleStrokeMin = 3;
        this.titleStrokeMax = 5;
        this.titleRot = 0;
        this.titleRotSpeed = Math.PI / 55;
        this.titleRotMax = Math.PI / 40;

        this.infoDiffY = 120;
        this.arrow = new Image();
        this.arrow.src = resPath + gameStates.mainMenu + "/arrowToGameName" + resFileType;
    }

    update(delta) {
        const T = delta / timeUnit;

        this.titleStroke += this.titleStrokeSpeed * T;
        if (this.titleStroke <= this.titleStrokeMin || this.titleStroke >= this.titleStrokeMax)
            this.titleStrokeSpeed *= -1;
        this.titleRot += this.titleRotSpeed * T;
        if (Math.abs(this.titleRot) >= this.titleRotMax) {
            this.titleRot = this.titleRotMax * Math.sign(this.titleRot);
            this.titleRotSpeed *= -1;
        }
    }

    draw() {
        cx.drawImage(this.background, 0, 0, canvas.width, canvas.height);

        // title
        cx.textAlign = "center";
        cx.textBaseline = "middle";
        cx.font = sc(180) + "px Impact";
        cx.fillStyle = "rgb(24,153,36)";
        cx.strokeStyle = "black";
        cx.lineWidth = sc(this.titleStroke);
        cx.save();
        cx.translate(sc(this.titlePos.x), sc(this.titlePos.y));
        cx.rotate(this.titleRot);
        cx.fillText(GAME_NAME, 0, 0);
        cx.strokeText(GAME_NAME, 0, 0);
        cx.restore();

        // info
        cx.textAlign = "right";
        cx.textBaseline = "bottom";
        cx.font = sc(70) + "px Impact";
        cx.fillStyle = "rgb(58,164,76)";
        cx.strokeStyle = "rgb(2,12,4)";
        cx.lineWidth = sc(3.5);
        // bottom to top
        let y = 20;
        cx.fillText("Press '"+keybindings.toggleFullscreen.toUpperCase()+"' for fullscreen", canvas.width - sc(70), canvas.height - sc(y));
        cx.strokeText("Press '"+keybindings.toggleFullscreen.toUpperCase()+"' for fullscreen", canvas.width - sc(70), canvas.height - sc(y));
        y += this.infoDiffY;
        cx.fillText("Press '"+keybindings.toggleSettings.toUpperCase()+"' to open settings", canvas.width - sc(70), canvas.height - sc(y));
        cx.strokeText("Press '"+keybindings.toggleSettings.toUpperCase()+"' to open settings", canvas.width - sc(70), canvas.height - sc(y));
        y += this.infoDiffY;
        cx.fillText("Press '"+keybindings.loadWorld.toUpperCase()+"' to load a world", canvas.width - sc(70), canvas.height - sc(y));
        cx.strokeText("Press '"+keybindings.loadWorld.toUpperCase()+"' to load a world", canvas.width - sc(70), canvas.height - sc(y));
        y += this.infoDiffY;
        cx.fillText("Press '"+keybindings.saveOrGenerateWorld.toUpperCase()+"' to generate a world", canvas.width - sc(70), canvas.height - sc(y));
        cx.strokeText("Press '"+keybindings.saveOrGenerateWorld.toUpperCase()+"' to generate a world", canvas.width - sc(70), canvas.height - sc(y));
        if (gameInstance != null) {
            y += this.infoDiffY;
            cx.fillText("Press '"+keybindings.exitToMenu.toUpperCase()+"' to continue game", canvas.width - sc(70), canvas.height - sc(y));
            cx.strokeText("Press '"+keybindings.exitToMenu.toUpperCase()+"' to continue game", canvas.width - sc(70), canvas.height - sc(y));
            cx.save();
            cx.translate(sc(590), canvas.height - sc(y + 15));
            cx.rotate(-0.2);
            cx.drawImage(this.arrow, 0, 0, sc(200), sc(120));
            cx.restore();
            cx.textAlign = "center";
            cx.font = sc(50) + "px Arial";
            cx.fillText("\""+gameInstance.saveName+"\"", sc(580), sc(750));
        }

        // game version
        cx.textAlign = "left";
        cx.textBaseline = "bottom";
        cx.font = sc(30) + "px Arial";
        cx.fillStyle = "rgb(58,164,76)";
        cx.fillText("v"+GAME_VERSION, sc(10), canvas.height - sc(10));

        // world gen info todo activate and test when loading time increases
        if (this.generatingWorld) {
            //cx.textAlign = "center";
            //cx.textBaseline = "middle";
            //cx.font = "50px Arial";
            //cx.fillStyle = "black";
            //cx.fillRect(canvas.width/2 - 100, canvas.height/2 - 60, 200, 120);
            //cx.fillStyle = "white";
        }
    }
}