const saveFileLowestSupportedVersion = 13;
function checkSaveFile(versionLine) {
    let v = parseInt(versionLine);
    return v >= saveFileLowestSupportedVersion;
}

const blockFillScale = 0.01;  // percentage of blockSize (in each direction)

class Game {
    constructor(save) {
        let worldSave = null;
        let playerSave = null;
        this.saveName = "Game"+Date.now().toString().substr(8);

        if (save != null) {
            this.saveName = save[0].substring(0, save[0].indexOf(saveFileType));  // save file name is passed as save[0]
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

        loadGraphics();

        this.sun = {  // todo sun on screen top, shift up/down in certain range by player y position in world, move to right (and on (-x^2)?)
            pos: new AVector(0, 0),
        }

        this.drawInventory = {
            xOffset: 30,
            yOffset: 20,
            space: 7,
            size: 50,
            itemScale: 0.75,
            blockScale: 0.4,
            bgColor: "rgba(99,83,188,0.8)",
            hotbarSelectStroke: 4,
            hotbarSelectColor: "rgba(244,244,255,0.9)",
            hotbarNumbersFontSize: 15,
        }

        this.useItemDrawSize = 1.5;

        this.swingTool = false;
        this.swingLeft = false;
        this.swingAngle = [-Math.PI/1.7, Math.PI*2, -Math.PI/1.7, Math.PI/8];  // current, speed, min, max
    }

    update(delta) {
        const T = delta / timeUnit;

        this.world.update(T);  // todo add list (in world class?) that knows blocks that have particles active, and update those (in world.update?)
        this.player.update(T);

        this.setPlayerScreenPos();

        // mouse interaction
        // TODO logic hold hotbar selection while lmb, on !lmb scroll (only once), then hold if lmb in meantime -> use booleans
        if (mouse.wheelUp > 0) {
            this.player.hotbarSelection--;
            if (this.player.hotbarSelection < 0) {
                this.player.hotbarSelection = this.player.inventory.length - 1;
            }
            mouse.wheelUp = 0;
            this.swingTool = false;
        }
        if (mouse.wheelDown > 0) {
            this.player.hotbarSelection++;
            if (this.player.hotbarSelection >= this.player.inventory.length) {
                this.player.hotbarSelection = 0;
            }
            mouse.wheelDown = 0;
            this.swingTool = false;
        }

        if (mouse.lmb) {
            if (false) { // todo check if mouse interacts with inventory, put following lines in else

            } else if (this.player.inventory[this.player.hotbarSelection][0].id !== 0) {
                let blockUnderMouse = new AVector(Math.floor(this.player.pos.x + (mouse.pos.x - this.playerScreenPos.x) / blockSize), Math.floor(this.player.pos.y + (mouse.pos.y - this.playerScreenPos.y) / blockSize));  // equation solved for i (see block drawing above): SCREEN_DRAW_POS.x = this.playerScreenPos.x + (i - this.player.pos.x) * blockSize
                // break block
                if (this.player.inventory[this.player.hotbarSelection][0].pickaxe) {
                    // animation
                    this.swingTool = true;
                    let sl = this.swingLeft;
                    this.swingLeft = blockUnderMouse.x < this.player.pos.x;  // todo use player-mouse vector angle as swing center
                    if (this.swingLeft !== sl) {
                        this.swingAngle[0] = this.swingAngle[2] + (this.swingLeft ? Math.PI/2 : 0);
                    }
                    this.swingAngle[0] += this.swingAngle[1] * T;
                    if (this.swingAngle[0] > this.swingAngle[3] + (this.swingLeft ? Math.PI/2 : 0)) {
                        this.swingAngle[0] = this.swingAngle[2] + (this.swingLeft ? Math.PI/2 : 0);
                    }
                    // logic
                    if (this.world.blockGrid[blockUnderMouse.x][blockUnderMouse.y].id !== "air") {
                        // break within building range
                        if (this.player.pos.y - blockUnderMouse.y - 1 <= this.player.range[0] + this.player.inventory[this.player.hotbarSelection][0].toolRangeAdd &&
                            blockUnderMouse.y - this.player.pos.y <= this.player.range[1] + this.player.inventory[this.player.hotbarSelection][0].toolRangeAdd &&
                            this.player.pos.x - blockUnderMouse.x - 1 <= this.player.range[2] + this.player.inventory[this.player.hotbarSelection][0].toolRangeAdd &&
                            blockUnderMouse.x - this.player.pos.x <= this.player.range[2] + this.player.inventory[this.player.hotbarSelection][0].toolRangeAdd) {
                            // execute
                            this.world.blockGrid[blockUnderMouse.x][blockUnderMouse.y].break(this.player.inventory[this.player.hotbarSelection][0].getPickaxePower() * T);
                        }
                    }
                }
                // place block
                else if (this.player.inventory[this.player.hotbarSelection][0].isBlock) {
                    console.log(this.player.inventory[this.player.hotbarSelection][0].id)
                    // do not place outside bounds or on solid block
                    if (blockUnderMouse.x >= 0 && blockUnderMouse.x < worldSize.x &&
                        blockUnderMouse.y >= 0 && blockUnderMouse.y < worldSize.y &&
                        this.world.blockGrid[blockUnderMouse.x][blockUnderMouse.y].id === "air") {
                        // place within building range
                        if (this.player.pos.y - blockUnderMouse.y - 1 <= this.player.range[0] &&
                            blockUnderMouse.y - this.player.pos.y <= this.player.range[1] &&
                            this.player.pos.x - blockUnderMouse.x - 1 <= this.player.range[2] &&
                            blockUnderMouse.x - this.player.pos.x <= this.player.range[2]) {
                            // do not place mid-air
                            if ((blockUnderMouse.x > 0 && this.world.blockGrid[blockUnderMouse.x-1][blockUnderMouse.y].id !== "air") ||
                                (blockUnderMouse.x < worldSize.x-1 && this.world.blockGrid[blockUnderMouse.x+1][blockUnderMouse.y].id !== "air") ||
                                (blockUnderMouse.y > 0 && this.world.blockGrid[blockUnderMouse.x][blockUnderMouse.y-1].id !== "air") ||
                                (blockUnderMouse.y < worldSize.y-1 && this.world.blockGrid[blockUnderMouse.x][blockUnderMouse.y+1].id !== "air")) {
                                // do not place on player
                                if ((Math.abs(this.player.pos.x - blockUnderMouse.x) >= this.player.radius &&
                                     Math.abs(this.player.pos.x - blockUnderMouse.x - 1) >= this.player.radius) ||
                                    (Math.abs(this.player.pos.y - blockUnderMouse.y) >= this.player.radius * 0.94 &&  // 6% tolerance for block below (balanced for 0.75 radius)
                                     Math.abs(this.player.pos.y - blockUnderMouse.y - 1) >= this.player.radius)) {
                                    // execute
                                    this.world.blockGrid[blockUnderMouse.x][blockUnderMouse.y].turnToBlock(this.player.inventory[this.player.hotbarSelection][0].id);
                                }
                            }
                        }
                    }
                }
            }
        } else {  // !lmb
            this.swingTool = false;
        }

        // reset tool animation
        if (!this.swingTool) {
            this.swingAngle[0] = this.swingAngle[2] + (this.swingLeft ? Math.PI/2 : 0);
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

        // world that is on screen
        for (let x = Math.max(0, Math.floor(this.player.pos.x - this.playerScreenPos.x/blockSize));
             x <= Math.min(worldSize.x-1, Math.floor(this.player.pos.x + (canvas.width-this.playerScreenPos.x)/blockSize)); x++) {
            for (let y = Math.max(0, Math.floor(this.player.pos.y - this.playerScreenPos.y/blockSize));
                 y <= Math.min(worldSize.y-1, Math.floor(this.player.pos.y + (canvas.height-this.playerScreenPos.y)/blockSize)); y++) {
                if (this.world.blockGrid[x][y].id !== "air") {
                    // save and restore drain FPS heavily!
                    cx.translate(this.playerScreenPos.x + (x - this.player.pos.x) * blockSize, this.playerScreenPos.y + (y - this.player.pos.y) * blockSize);
                    if (this.world.blockGrid[x][y].light <= 0) {
                        // draw shadow instead of block
                        cx.fillStyle = "black";
                        cx.fillRect(-blockFillScale * blockSize, -blockFillScale * blockSize, blockSize * (1+blockFillScale), blockSize * (1+blockFillScale));
                    } else {
                            // todo maybe add performance option: draw rect, not sprite
                            //cx.fillStyle = this.world.blockGrid[x][y].particleColors[0];
                            //cx.fillRect(-blockFillScale * blockSize, -blockFillScale * blockSize, blockSize * (1+blockFillScale), blockSize * (1+blockFillScale));
                        // block sprite
                        cx.drawImage(blockSprites[this.world.blockGrid[x][y].id][this.world.blockGrid[x][y].useSprite], 0, 0, blockSize, blockSize);
                        // block destruction sprite
                        if (this.world.blockGrid[x][y].broken > 0) {
                            cx.drawImage(blockDestructionSprites[Math.ceil(this.world.blockGrid[x][y].broken / blockDestructionSprites.length) - 1], 0, 0, blockSize, blockSize);
                        }
                        // light/shadow
                        if (this.world.blockGrid[x][y].light < 1) {
                            cx.fillStyle = "rgba(0,0,0," + (1 - this.world.blockGrid[x][y].light) + ")";
                            cx.fillRect(-blockFillScale * blockSize, -blockFillScale * blockSize, blockSize * (1+blockFillScale), blockSize * (1+blockFillScale));
                        }
                    }
                    cx.translate(-(this.playerScreenPos.x + (x - this.player.pos.x) * blockSize), -(this.playerScreenPos.y + (y - this.player.pos.y) * blockSize));
                }
            }
        }

        // player
        cx.fillStyle = this.player.color;
        cx.beginPath();
        cx.arc(this.playerScreenPos.x, this.playerScreenPos.y, this.player.radius * blockSize, 0, 2*Math.PI);
        cx.fill();

        // tools
        if (this.swingTool) {
            cx.translate(this.playerScreenPos.x + (this.swingLeft ? -1 : 1) * this.player.radius*blockSize/3, this.playerScreenPos.y);
            cx.rotate(this.swingLeft ? Math.PI - this.swingAngle[0] : this.swingAngle[0]);
            cx.drawImage(itemSprites[this.player.inventory[this.player.hotbarSelection][0].id], 0, 0, this.useItemDrawSize * blockSize, this.useItemDrawSize * blockSize);
            // translate back
            cx.rotate(-(this.swingLeft ? Math.PI - this.swingAngle[0] : this.swingAngle[0]));
            cx.translate(-(this.playerScreenPos.x + (this.swingLeft ? -1 : 1) * this.player.radius*blockSize/3), -this.playerScreenPos.y);
        }

        // todo lighting overlay
        //cx.save();
        //cx.globalAlpha = 0.4;
        //cx.fillStyle = "rgb(13,31,79)";
        //cx.fillRect(0, 0, canvas.width, canvas.height);
        //cx.globalAlpha = 0.1;
        //cx.fillStyle = "rgb(188,82,11)";
        //cx.fillRect(0, 0, canvas.width, canvas.height);
        //cx.restore();

        // inventory
        cx.textAlign = "left";
        cx.textBaseline = "top";
        for (let i = 0; i < this.player.inventory.length; i++) {
            for (let j = 0; j < (inventory.show ? this.player.inventory[i].length : 1); j++) {
                cx.fillStyle = this.drawInventory.bgColor;
                cx.fillRect(
                    sc(this.drawInventory.xOffset + i * (this.drawInventory.size + this.drawInventory.space), settings.uiScaleChoice),
                    sc(this.drawInventory.yOffset + j * (this.drawInventory.size + this.drawInventory.space), settings.uiScaleChoice),
                    sc(this.drawInventory.size, settings.uiScaleChoice), sc(this.drawInventory.size, settings.uiScaleChoice));
                if (j === 0) {
                    if (this.player.hotbarSelection === i) {
                        cx.lineWidth = this.drawInventory.hotbarSelectStroke;
                        cx.strokeStyle = this.drawInventory.hotbarSelectColor;
                        cx.strokeRect(
                            sc(this.drawInventory.xOffset + i * (this.drawInventory.size + this.drawInventory.space), settings.uiScaleChoice),
                            sc(this.drawInventory.yOffset + j * (this.drawInventory.size + this.drawInventory.space), settings.uiScaleChoice),
                            sc(this.drawInventory.size, settings.uiScaleChoice), sc(this.drawInventory.size, settings.uiScaleChoice));
                    }
                    cx.font = sc(this.drawInventory.hotbarNumbersFontSize, settings.uiScaleChoice) + "px Arial";
                    cx.fillStyle = "black";
                    cx.fillText(((i===9?-1:i)+1)+"",
                        sc(4+ this.drawInventory.xOffset + i * (this.drawInventory.size + this.drawInventory.space), settings.uiScaleChoice),
                        sc(3+ this.drawInventory.yOffset + j * (this.drawInventory.size + this.drawInventory.space), settings.uiScaleChoice));
                }
                // items in inventory
                if (this.player.inventory[i][j].id !== INVENTORY_EMPTY) {
                    if (this.player.inventory[i][j].isBlock) {  // item has sprite in blockSprites
                        cx.drawImage(blockSprites[this.player.inventory[i][j].id][0],
                            sc(this.drawInventory.xOffset + i * (this.drawInventory.size + this.drawInventory.space), settings.uiScaleChoice) + sc((1 - this.drawInventory.blockScale) * this.drawInventory.size/2, settings.uiScaleChoice),
                            sc(this.drawInventory.yOffset + j * (this.drawInventory.size + this.drawInventory.space), settings.uiScaleChoice) + sc((1 - this.drawInventory.blockScale) * this.drawInventory.size/2, settings.uiScaleChoice),
                            sc(this.drawInventory.size, settings.uiScaleChoice * this.drawInventory.blockScale), sc(this.drawInventory.size, settings.uiScaleChoice * this.drawInventory.blockScale));
                    } else {  // item has sprite in itemSprites
                        cx.translate(
                            sc(this.drawInventory.xOffset + i * (this.drawInventory.size + this.drawInventory.space), settings.uiScaleChoice) + sc((1 - this.drawInventory.itemScale) * this.drawInventory.size/2, settings.uiScaleChoice),
                            sc(this.drawInventory.yOffset + j * (this.drawInventory.size + this.drawInventory.space), settings.uiScaleChoice) + sc((1 + this.drawInventory.itemScale) * this.drawInventory.size/2, settings.uiScaleChoice));
                        cx.rotate(-Math.PI/2);
                        cx.drawImage(itemSprites[this.player.inventory[i][j].id],
                            0, 0, sc(this.drawInventory.size, settings.uiScaleChoice * this.drawInventory.itemScale), sc(this.drawInventory.size, settings.uiScaleChoice * this.drawInventory.itemScale));
                        // translate back
                        cx.rotate(Math.PI/2);
                        cx.translate(
                            -(sc(this.drawInventory.xOffset + i * (this.drawInventory.size + this.drawInventory.space), settings.uiScaleChoice) + sc((1 - this.drawInventory.itemScale) * this.drawInventory.size/2, settings.uiScaleChoice)),
                            -(sc(this.drawInventory.yOffset + j * (this.drawInventory.size + this.drawInventory.space), settings.uiScaleChoice) + sc((1 + this.drawInventory.itemScale) * this.drawInventory.size/2, settings.uiScaleChoice)));
                    }
                }
            }
        }
    }

    save() {
        return GAME_VERSION +"\n"+
            //gameInstance.saveName +"\n"+
            this.world.save() +
            this.player.save();
    }
}