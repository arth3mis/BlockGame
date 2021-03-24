class Settings {
    constructor() {
        this.heightP = 0.7;  // percentage of dimension height
        this.widthP = 0.8;  // percentage of heightP
        this.titleHeightP = 0.15;  // percentage of heightP
        this.maxButtonsDisplayed = 15;  // todo add scrolling mechanic

        this.size = new AVector(0, 0);

        this.stdTitle = "Settings";
        this.title = this.stdTitle;

        this.colors = {
            border: ["rgb(37,60,74)", "rgb(151,210,165)"],
            bgFill: ["rgb(63,136,176)", "rgb(67,176,63)"],
            titleBG: ["rgb(43,90,115)", "rgb(43,115,50)"],
            title: ["rgb(87,159,198)", "rgb(87,198,89)"],
            hoverButton: ["rgb(58,127,165)", "rgb(58,165,60)"],
        }

        // buttons
        this.buttons = [
            "Resolution",
            "Graphics",
            "Keybindings",
            "Zoom",
            // TODO ui scale
            // TODO display fps
        ];
        this.stdButtonTexts = [];
        for (let i = 0; i < this.buttons.length; i++) {
            this.stdButtonTexts.push(this.buttons[i]);
        }
        this.buttonTexts = this.stdButtonTexts.slice();

        this.buttonHovered = -1;
        this.buttonClicked = -1;
    }

    update() {
        this.size.set(canvas.height * this.heightP * this.widthP, canvas.height * this.heightP);
        let relativeMouse = new AVector(mouse.pos.x - canvas.width/2, mouse.pos.y - canvas.height/2);
        if (Math.abs(relativeMouse.x) < this.size.x/2 && relativeMouse.y >= this.size.y * this.titleHeightP - this.size.y/2 && relativeMouse.y < this.size.y/2) {
            let hover = (relativeMouse.y + this.size.y/2 - this.size.y * this.titleHeightP) / (this.size.y * (1 - this.titleHeightP) / this.buttonTexts.length);
            this.buttonHovered = Math.floor(hover);
            if (mouse.lmbTriggered) {
                switch (this.buttonClicked) {
                    // main page
                    case -1:
                        this.buttonClicked = this.buttonHovered;
                        // switch to new settings page
                        switch (this.buttonClicked) {
                            // resolution
                            case 0:
                                this.title = "Current: " + settings.dimension.x + "x" + settings.dimension.y;
                                this.buttonTexts = [];
                                for (let i = 0; i < settings.dimensions.length; i++) {
                                    this.buttonTexts.push(settings.dimensions[i][0] + "x" + settings.dimensions[i][1]);
                                }
                                this.buttonTexts.push("Back");
                                break;
                            // graphics
                            case 1:
                                this.title = "Current: " + settings.graphicsRange[settings.graphicsChoice].replace(" (recommended)", "");
                                this.buttonTexts = [];
                                for (let i = 0; i < settings.graphicsRange.length; i++) {
                                    this.buttonTexts.push(settings.graphicsRange[i]);
                                }
                                this.buttonTexts.push("Back");
                                break;
                            // keybindings
                            case 2:
                                this.title = "Keybindings";
                                this.buttonTexts = [];
                                for (const u in keybindings) {
                                    if (keybindings.hasOwnProperty(u)) {
                                        const c = u.replaceAll(/[a-z]/g, "");
                                        let s = u.replaceAll(/[A-Z]/g, " ");
                                        for (let i = 0, p = 0; i < c.length; i++) {
                                            p = s.indexOf(" ", p) + 1;
                                            s = s.substring(0, p) + c.charAt(i).toLowerCase() + s.substring(p);
                                        }
                                        s = s.charAt(0).toUpperCase() + s.substr(1);
                                        this.buttonTexts.push(s + ": '" + (keybindings[u] === " " ? "SPACE" : keybindings[u].toUpperCase()) + "'");
                                    }
                                }
                                this.buttonTexts.push("Back");
                                break;
                            // zoom
                            case 3:
                                this.title = "Current: " + Math.round((1 + settings.zoomFactorChoice)*10)/10;
                                this.buttonTexts = [];
                                for (let i = 1; i <= 2; i = Math.round((i + 0.1)*10)/10) {
                                    this.buttonTexts.push(i);
                                }
                                this.buttonTexts.push("Back");
                                break;
                        }
                        break;
                    // resolution
                    case 0:
                        if (this.buttonHovered === this.buttonTexts.length - 1) {
                            this.setMainPage();
                            break;
                        }
                        settings.dimensionChoice = this.buttonHovered;
                        setFrameSize();
                        updateBlockSize();
                        // update player onscreen position for background drawing
                        if (gameInstance != null) {
                            gameInstance.setPlayerScreenPos();
                            // update graphics when auto (necessity is checked in loadSprites)
                            if (settings.graphicsChoice === settings.worldBlockSpriteSizes.length) {
                                gameInstance.world.loadBlockSprites();
                                loadItemSprites(gameInstance.world);
                            }
                        }
                        this.title = "Current: " + settings.dimension.x + "x" + settings.dimension.y;
                        break;
                    // graphics
                    case 1:
                        if (this.buttonHovered === this.buttonTexts.length - 1) {
                            this.setMainPage();
                            break;
                        }
                        settings.graphicsChoice = this.buttonHovered;
                        if (gameInstance != null) {
                            gameInstance.world.loadBlockSprites();
                            loadItemSprites(gameInstance.world);
                        }
                        this.title = "Current: " + settings.graphicsRange[settings.graphicsChoice].replace(" (recommended)", "");
                        break;
                    // keybindings
                    case 2:
                        if (this.buttonHovered === this.buttonTexts.length - 1) {
                            this.setMainPage();
                            break;
                        }
                        break;
                    // zoom
                    case 3:
                        if (this.buttonHovered === this.buttonTexts.length - 1) {
                            this.setMainPage();
                            break;
                        }
                        settings.zoomFactorChoice = this.buttonTexts[this.buttonHovered] - 1;
                        translateZoom();
                        updateBlockSize();
                        // update player onscreen position for background drawing
                        if (gameInstance != null) {
                            gameInstance.setPlayerScreenPos();
                            // update graphics when auto (necessity is checked in loadSprites)
                            if (settings.graphicsChoice === settings.worldBlockSpriteSizes.length) {
                                gameInstance.world.loadBlockSprites();
                                loadItemSprites(gameInstance.world);
                            }
                        }
                        this.title = "Current: " + Math.round((1 + settings.zoomFactorChoice)*10)/10;
                        break;
                }
                mouse.lmbTriggered = false;
            }
        } else {
            this.buttonHovered = -1;
            if (mouse.lmbTriggered) {
                mouse.lmbTriggered = false;
            }
        }
    }

    setMainPage() {
        this.title = this.stdTitle;
        this.buttonTexts = this.stdButtonTexts.slice();
        this.buttonClicked = -1;
    }

    draw(overMainMenu=false) {
        let mm = 0;
        if (overMainMenu) {
            mm = 1;
            cx.globalAlpha = 0.4;
            cx.fillStyle = "black";
            cx.fillRect(0, 0, canvas.width, canvas.height);
            cx.globalAlpha = 1;
        }
        cx.save();
        cx.translate(canvas.width/2 - this.size.x/2, canvas.height/2 - this.size.y/2);

        // border/background
        cx.lineWidth = sc(25);
        cx.strokeStyle = this.colors.border[mm];
        cx.fillStyle = this.colors.bgFill[mm];
        cx.beginPath();
        cx.moveTo(0, 0);
        cx.lineTo(this.size.x, 0);
        cx.lineTo(this.size.x, this.size.y);
        cx.lineTo(0, this.size.y);
        cx.lineTo(0, -cx.lineWidth/2);
        cx.stroke();
        cx.fill();

        cx.font = sc(40) + "px Arial";

        // title
        cx.fillStyle = this.colors.titleBG[mm];
        cx.fillRect(0, 0, this.size.x, this.size.y * this.titleHeightP);
        cx.textAlign = "center";
        cx.textBaseline = "middle";
        cx.fillStyle = this.colors.title[mm];
        cx.fillText(this.title, this.size.x/2, this.size.y * this.titleHeightP / 2);

        // draw buttons
        let btnHeight = this.size.y * (1 - this.titleHeightP) / this.buttonTexts.length;
        for (let i = 0; i < this.buttonTexts.length; i++) {
            if (this.buttonHovered === i) {
                cx.fillStyle = this.colors.hoverButton[mm];
                cx.fillRect(0, this.size.y * this.titleHeightP + i * btnHeight, this.size.x, btnHeight);
                cx.fillStyle = "white";
            } else {
                cx.fillStyle = "black";
            }
            cx.fillText(this.buttonTexts[i], this.size.x/2, this.size.y * this.titleHeightP + i * btnHeight + btnHeight/2);

        }
        cx.restore();
    }
}