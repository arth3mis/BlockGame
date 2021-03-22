class Game {
    constructor(save) {
        let worldSave = null;
        let playerSave = null;
        this.saveName = "Game"+Date.now().toString().substr(8);

        if (save != null) {
            this.saveName = save[0].substring(0, save[0].indexOf(saveFileType));
            save.shift();  // removes file name from array
            let i;
            for (i = 0; i < save.length; i++) {
                if (save[i] === playerSaveSeparator)
                    break;
            }
            worldSave = save.slice(1, i);  // line 0 is game version (evaluated in preloadCore/uploadFile())
            playerSave = save.slice(i+1);
        }
        this.world = new World(worldSave);
        this.player = new Player(this.world, playerSave);
        this.playerScreenPos = new AVector(canvas.width/2, canvas.height/2);
    }

    update(delta) {
        const T = delta / timeUnit;

        this.world.update(T);  // todo add list (in world class?) that knows blocks that have particles active, and update those (in world.update?)
        this.player.update(T);

        this.setPlayerScreenPos();

        // mouse interaction
        if (mouse.lmb) {
            let blockUnderMouse = new AVector(Math.floor(this.player.pos.x + (mouse.pos.x - this.playerScreenPos.x) / blockSize), Math.floor(this.player.pos.y + (mouse.pos.y - this.playerScreenPos.y) / blockSize));  // equation solved for i (see block drawing above): SCREEN_DRAW_POS.x = this.playerScreenPos.x + (i - this.player.pos.x) * blockSize
            if (this.world.blockGrid[blockUnderMouse.x][blockUnderMouse.y].id !== 0) {
                this.world.blockGrid[blockUnderMouse.x][blockUnderMouse.y].break(500 * T);
            }
        } else if (mouse.mmb) {
            let blockUnderMouse = new AVector(Math.floor(this.player.pos.x + (mouse.pos.x - this.playerScreenPos.x) / blockSize), Math.floor(this.player.pos.y + (mouse.pos.y - this.playerScreenPos.y) / blockSize));
            // do not place outside bounds or on solid block
            if (blockUnderMouse.x >= 0 && blockUnderMouse.x < worldSize.x &&
                blockUnderMouse.y >= 0 && blockUnderMouse.y < worldSize.y &&
                this.world.blockGrid[blockUnderMouse.x][blockUnderMouse.y].id === 0) {
                // do not place mid-air
                if ((blockUnderMouse.x > 0 && this.world.blockGrid[blockUnderMouse.x-1][blockUnderMouse.y].id !== 0) ||
                    (blockUnderMouse.x < worldSize.x-1 && this.world.blockGrid[blockUnderMouse.x+1][blockUnderMouse.y].id !== 0) ||
                    (blockUnderMouse.y > 0 && this.world.blockGrid[blockUnderMouse.x][blockUnderMouse.y-1].id !== 0) ||
                    (blockUnderMouse.y < worldSize.y-1 && this.world.blockGrid[blockUnderMouse.x][blockUnderMouse.y+1].id !== 0)) {
                    // do not place on player
                    if ((Math.abs(this.player.pos.x - blockUnderMouse.x) >= this.player.radius &&
                         Math.abs(this.player.pos.x - blockUnderMouse.x - 1) >= this.player.radius) ||
                        (Math.abs(this.player.pos.y - blockUnderMouse.y) >= this.player.radius * 0.95 &&  // 5% tolerance for block below (if hanging slightly over edge)
                         Math.abs(this.player.pos.y - blockUnderMouse.y - 1) >= this.player.radius)) {
                        this.world.blockGrid[blockUnderMouse.x][blockUnderMouse.y].turnToBlock(2);
                    }
                }
            }
        }

        // lighting
        let visibleBounds = [
            Math.max(0, Math.floor(this.player.pos.x - this.playerScreenPos.x/blockSize)),
            Math.min(worldSize.x-1, Math.floor(this.player.pos.x + (canvas.width-this.playerScreenPos.x)/blockSize)),
            Math.max(0, Math.floor(this.player.pos.y - this.playerScreenPos.y/blockSize)),
            Math.min(worldSize.y-1, Math.floor(this.player.pos.y + (canvas.height-this.playerScreenPos.y)/blockSize))
        ];
        this.world.updateLighting(visibleBounds);
    }

    setPlayerScreenPos() {
        this.playerScreenPos.set(canvas.width/2, canvas.height/2);
        // x world border on screen
        if (this.player.pos.x < canvas.width/2 / blockSize) {
            this.playerScreenPos.add(this.player.pos.x * blockSize - canvas.width/2, 0);
        } else if (this.player.pos.x > worldSize.x - canvas.width/2 / blockSize) {
            this.playerScreenPos.add((this.player.pos.x - (worldSize.x - canvas.width/2 / blockSize)) * blockSize, 0);
        }
        // y world border on screen
        if (this.player.pos.y < canvas.height/2 / blockSize) {
            this.playerScreenPos.add(0, this.player.pos.y * blockSize - canvas.height/2);
        } else if (this.player.pos.y > worldSize.y - canvas.height/2 / blockSize) {
            this.playerScreenPos.add(0, (this.player.pos.y - (worldSize.y - canvas.height/2 / blockSize)) * blockSize);
        }
    }

    draw() {
        cx.fillStyle = this.world.background;
        cx.fillRect(0, 0, canvas.width, canvas.height);

        // draw world that is on screen
        for (let x = Math.max(0, Math.floor(this.player.pos.x - this.playerScreenPos.x/blockSize));
             x <= Math.min(worldSize.x-1, Math.floor(this.player.pos.x + (canvas.width-this.playerScreenPos.x)/blockSize)); x++) {
            for (let y = Math.max(0, Math.floor(this.player.pos.y - this.playerScreenPos.y/blockSize));
                 y <= Math.min(worldSize.y-1, Math.floor(this.player.pos.y + (canvas.height-this.playerScreenPos.y)/blockSize)); y++) {
                if (this.world.blockGrid[x][y].id !== 0) {
                    cx.save();
                    cx.translate(this.playerScreenPos.x + (x - this.player.pos.x) * blockSize, this.playerScreenPos.y + (y - this.player.pos.y) * blockSize);
                    if (this.world.blockGrid[x][y].light <= 0) {
                        // draw shadow instead of block
                        cx.fillStyle = "black";
                        cx.fillRect(0, 0, blockSize, blockSize); // todo here and in light/shadow: add block coverage (-0.4;+0.3 maybe?)
                    } else {
                        // block sprite
                        cx.drawImage(this.world.blockSprites[this.world.blockGrid[x][y].id - 1], 0, 0, blockSize, blockSize);
                        // break animation sprite
                        if (this.world.blockGrid[x][y].broken > 0) {
                            cx.drawImage(this.world.blockDestructionSprites[Math.ceil(this.world.blockGrid[x][y].broken / this.world.blockDestructionSprites.length) - 1], 0, 0, blockSize, blockSize);
                        }
                        // light/shadow
                        if (this.world.blockGrid[x][y].light < 1) {
                            cx.fillStyle = "rgba(0,0,0," + (1 - this.world.blockGrid[x][y].light) + ")";
                            cx.fillRect(0, 0, blockSize, blockSize);
                        }
                    }
                    cx.restore();
                }
            }
        }

        cx.fillStyle = this.player.color;
        cx.beginPath();
        cx.arc(this.playerScreenPos.x, this.playerScreenPos.y, this.player.radius * blockSize, 0, 2*Math.PI);
        cx.fill();

        // todo lighting overlay
        //cx.save();
        //cx.globalAlpha = 0.4;
        //cx.fillStyle = "rgb(13,31,79)";
        //cx.fillRect(0, 0, canvas.width, canvas.height);
        //cx.globalAlpha = 0.1;
        //cx.fillStyle = "rgb(188,82,11)";
        //cx.fillRect(0, 0, canvas.width, canvas.height);
        //cx.restore();
    }

    save() {
        return GAME_VERSION +"\n"+
            //gameInstance.saveName +"\n"+
            this.world.save() +
            this.player.save();
    }
}