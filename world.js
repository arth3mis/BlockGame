let blockSize;
function updateBlockSize() {
    blockSize = canvas.height / settings.blocksInHeight;
}
updateBlockSize();

class World {
    constructor(save) {
        if (save == null) {
            this.generate();
        } else {
            this.load(save);
        }
        this.background = cx.createLinearGradient(0, 0, 0, canvas.height);
        this.background.addColorStop(0, "rgb(157,176,174)");
        this.background.addColorStop(0.4, "rgb(127,140,139)");
        this.background.addColorStop(1, "rgb(103,112,112)");

        this.loadedGraphics = null;
        this.blockSprites = new Array(2);
        this.blockDestructionSprites = new Array(10);
        this.loadSprites();
    }

    loadSprites() {
        let graphicsFile = "error";
        if (settings.graphicsChoice < settings.worldBlockSpriteSizes.length) {
            graphicsFile = settings.graphicsRange[settings.graphicsChoice].toLowerCase();
        } else if (settings.graphicsChoice === settings.worldBlockSpriteSizes.length) {
            graphicsFile = settings.graphicsRange[this.findClosestSpriteSize(true)];
        } else if (settings.graphicsChoice === settings.worldBlockSpriteSizes.length + 1) {
            graphicsFile = settings.graphicsRange[this.findClosestSpriteSize(false)];
        }
        if (graphicsFile === this.loadedGraphics) {
            return;
        }

        for (let i = 0; i < this.blockSprites.length; i++) {
            this.blockSprites[i] = new Image();
            this.blockSprites[i].src = resPath + "b" + (i+1) + "/" + graphicsFile + resFileType;
        }
        for (let i = 0; i < this.blockDestructionSprites.length; i++) {
            this.blockDestructionSprites[i] = new Image();
            this.blockDestructionSprites[i].src = resPath + "bDestroy/" + i + "/" + graphicsFile + resFileType;
        }
    }

    findClosestSpriteSize(roundUp) {
        for (let i = 0; i < settings.worldBlockSpriteSizes.length; i++) {
            if (blockSize >= settings.worldBlockSpriteSizes[i]) {
                // get the middle between sizes
                if (i > 0 && roundUp /*blockSize >= (settings.worldBlockSpriteSizes[i-1] + settings.worldBlockSpriteSizes[i]) / 2*/) {
                    return i-1;
                } else {
                    return i;
                }
            }
        }
        // blockSize < settings.worldBlockSpriteSizes[settings.worldBlockSpriteSizes.length - 1]
        return settings.worldBlockSpriteSizes.length - 1;
    }

    update(T) {
        this.day += T / dayLength;
    }

    load(save) {

    }

    generate() {
        this.day = 0;

        this.blockGrid = new Array(worldSize.x);
        for (let i = 0; i < worldSize.x; i++) {
            this.blockGrid[i] = new Array(worldSize.y);
            for (let j = 0; j < Math.floor(worldSize.y * 0.6); j++) {
                this.blockGrid[i][j] = new Block(0);
            }
            for (let j = Math.floor(worldSize.y * 0.6); j < worldSize.y; j++) {
                if (i<20||j===worldSize.y-1||(i>=20&&j>i-20)) this.blockGrid[i][j] = new Block(j === worldSize.y-1 ? 2 : 1);
                else this.blockGrid[i][j] = new Block(0);
            }
        }
        this.blockGrid[3][Math.floor(worldSize.y * 0.6)] = new Block(0);
        this.blockGrid[4][Math.floor(worldSize.y * 0.6)] = new Block(0);


        this.blockGrid[9][Math.floor(worldSize.y * 0.6)-1] = new Block(1);

        //this.blockGrid[12][Math.floor(worldSize.y * 0.6)-1] = new Block(1);
        this.blockGrid[12][Math.floor(worldSize.y * 0.6)-2] = new Block(1);
        this.blockGrid[12][Math.floor(worldSize.y * 0.6)] = new Block(0);
        this.blockGrid[13][Math.floor(worldSize.y * 0.6)] = new Block(0);

        this.blockGrid[16][Math.floor(worldSize.y * 0.6)-4] = new Block(1);

        for (let i = Math.floor(worldSize.y * 0.6); i < Math.floor(worldSize.y * 0.6) + 7; i++) {
            this.blockGrid[18][i] = new Block(0);
            this.blockGrid[19][i] = new Block(0);
        }
        this.blockGrid[20][Math.floor(worldSize.y * 0.6) + 4].id = 0;

        //this.blockGrid[25][Math.floor(worldSize.y * 0.6)] = new Block(0);
        this.blockGrid[26][Math.floor(worldSize.y * 0.6)] = new Block(0);
        this.blockGrid[27][Math.floor(worldSize.y * 0.6)] = new Block(0);
        this.blockGrid[27][Math.floor(worldSize.y * 0.6)-1] = new Block(1);
        this.blockGrid[27][Math.floor(worldSize.y * 0.6)-1].broken = 85;

        this.blockGrid[23][worldSize.y-7] = new Block(2);
        this.blockGrid[24][worldSize.y-7] = new Block(2);
        this.blockGrid[27][worldSize.y-4] = new Block(2);
        this.blockGrid[28][worldSize.y-4] = new Block(2);
        this.blockGrid[29][worldSize.y-4] = new Block(2);

        this.blockGrid[0][10] = new Block(1);
        this.blockGrid[5][5] = new Block(1);
    }
}