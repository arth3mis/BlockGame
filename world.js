let worldSize;
let blockSize;
function updateBlockSize() {
    blockSize = canvas.height / settings.blocksInHeight;
}
updateBlockSize();

const worldTime = {
    dayLength: 60,  // in seconds resp. timeUnits    day starts at 6:00
    sunrise: [0.9375, 1],      // 4:30 - 6:00
    sunset: [0.5417, 0.6042],  // 19:00 - 20:30
}

let lightBaseValue = 0.25;
const lightThreshold = 0.06;
const lightRoundToZero = 1e-6;

const saveFileLowestSupportedVersion = 7;
function checkSaveFile(versionLine) {
    let v = parseInt(versionLine);
    return v >= saveFileLowestSupportedVersion;
}

class World {
    constructor(save) {
        if (save == null) {
            this.generate();
        } else {
            this.load(save);
        }
        this.updateLighting([0, worldSize.x-1, 0, worldSize.y-1]);  // generate lighting for whole world

        this.background = cx.createLinearGradient(0, 0, 0, canvas.height);
        this.background.addColorStop(0, "rgb(91,168,217)");
        this.background.addColorStop(0.4, "rgb(75,137,177)");
        this.background.addColorStop(1, "rgb(67,123,159)");

        this.loadedGraphics = null;
        this.blockSprites = new Array(BLOCKS_NUMBER);
        this.blockDestructionSprites = new Array(10);
        this.loadBlockSprites();
    }

    loadBlockSprites() {  // todo move to game.js
        let graphicsFile = getChosenGraphicsFile();
        if (graphicsFile === this.loadedGraphics) {  // chosen graphics are already loaded
            return;
        }
        this.loadedGraphics = graphicsFile;

        for (let i = 0; i < BLOCKS_NUMBER; i++) {
            this.blockSprites[i] = [];
            for (let j = 0; j < BLOCKS_SPRITE_VARIATIONS[i]; j++) {
                this.blockSprites[i].push(new Image());
                this.blockSprites[i][j].src = resPath + "b" + (i+1) + "/" + j + "/" + graphicsFile + resFileType;
            }
        }
        for (let i = 0; i < this.blockDestructionSprites.length; i++) {
            this.blockDestructionSprites[i] = new Image();
            this.blockDestructionSprites[i].src = resPath + "bDestroy/" + i + "/" + graphicsFile + resFileType;
        }
    }

    update(T) {
        this.day += T / worldTime.dayLength;
    }

    updateLighting(visibleBounds) {
        for (let x = visibleBounds[0]; x <= visibleBounds[1]; x++) {
            for (let y = visibleBounds[2]; y <= visibleBounds[3]; y++) {
                if (this.blockGrid[x][y].needsLightingUpdate()) {
                    if (typeof this.blockGrid[x][y].prevLightEmission[0] === "number") {  // dont execute on first lighting
                        this.lightingCalc(x, y, this.blockGrid[x][y].prevLightEmission[0], this.blockGrid[x][y].prevLightEmission[1], -1);  // reverse previous lighting
                    }
                    this.lightingCalc(x, y, this.blockGrid[x][y].lightEmission[0], this.blockGrid[x][y].lightEmission[1], 1);
                    this.blockGrid[x][y].prevLightEmission = this.blockGrid[x][y].lightEmission.slice();
                }
            }
        }
    }

    lightingCalc(x, y, strength, radius, sign) {
        for (let i = -radius; i < radius+1; i++) {
            for (let j = -radius; j < radius+1; j++) {
                if (x+i < 0 || x+i >= worldSize.x || y+j < 0 || y+j >= worldSize.y) {  // update outside of visibleBounds, too
                    continue;
                }
                if (Math.sqrt(i*i + j*j) !== 0) {
                    let a = sign * (lightBaseValue * strength / Math.sqrt(i*i + j*j));
                    if (Math.abs(a) >= lightThreshold) {  // dont add too little light
                        this.blockGrid[x+i][y+j].light += a;
                    }
                    if (this.blockGrid[x+i][y+j].light > 0 && this.blockGrid[x+i][y+j].light < lightRoundToZero) {  // floor too small values to 0
                        this.blockGrid[x+i][y+j].light = 0;
                    }
                }
            }
        }
    }


    load(save) {
        const preBlockDataLines = 4;

        let l = 0;
        let s = save[l++].split(saveSeparator);
        worldSize = new AVector(parseInt(s[0]), parseInt(s[1]));
        this.surfaceLevel = parseInt(save[l++]);
        this.day = parseFloat(save[l++]);
        s = save[l++].split(saveSeparator);
        this.worldSpawn = new AVector(parseInt(s[0]), parseInt(s[1]));
        // block data
        this.blockGrid = new Array(worldSize.x);
        for (let x = 0; x < worldSize.x; x++) {
            this.blockGrid[x] = new Array(worldSize.y);
            s = save[preBlockDataLines + x].split(saveSeparator);
            for (let y = 0; y < worldSize.y; y++) {
                this.blockGrid[x][y] = new Block(parseInt(s[y].split(saveSeparator2)[0]), parseInt(s[y].split(saveSeparator2)[1]));
            }
        }
    }

    save() {
        let s = worldSize.x + saveSeparator + worldSize.y +"\n"+
            this.surfaceLevel +"\n"+
            this.day +"\n"+
            this.worldSpawn.x + saveSeparator + this.worldSpawn.y +"\n";
        // block data
        for (let x = 0; x < worldSize.x; x++) {
            for (let y = 0; y < worldSize.y; y++) {
                s += this.blockGrid[x][y].id + saveSeparator2 + this.blockGrid[x][y].useSprite + saveSeparator;
            }
            s += "\n";
        }
        return s;  // always end with "\n"
    }

    generate() {
        worldSize = new AVector(500, 200);
        this.surfaceLevel = Math.floor(worldSize.y * 0.6);
        this.day = 0;

        // TEST FOR HEIGHTMAP
        this.seed = 2; // Seed
        this.smoothness = 50; // Smoothes with neighboring elements of Height Map
        this.heightMap = new Array(worldSize.x);

        // Set Seed
        noise.seed(this.seed);


        for (let i = 0; i < worldSize.x; i++) {
            this.heightMap[i] = this.surfaceLevel;

            // Big elevations
            this.heightMap[i] += noise.simplex2(i/this.smoothness/2, 0) * 10;

            // Medium elevations
            this.heightMap[i] += noise.simplex2(i/this.smoothness, 1) * 5;

            // Small elevations
            this.heightMap[i] += noise.simplex2(i/this.smoothness * 2, 1) * 5;

            // This is an integer
            this.heightMap[i] = Math.floor(this.heightMap[i]);
        }

        for (let i = 0; i < worldSize.x; i++) {
            //this.blockGrid[i][this.heightMap[i]] = new Block(3);
        }


        this.blockGrid = new Array(worldSize.x);
        for (let i = 0; i < worldSize.x; i++) {
            this.blockGrid[i] = new Array(worldSize.y);
            for (let j = 0; j < worldSize.y; j++) {
                if (j === this.heightMap[i]) {
                    this.blockGrid[i][j] = new Block(1, 1);
                } else if (j > this.heightMap[i]) {
                    let type = Math.floor(Math.random()*1.2+1);
                    this.blockGrid[i][j] = new Block(type);
                } else {
                    this.blockGrid[i][j] = new Block(0);
                }
            }
        }





        this.worldSpawn = new AVector(40, this.surfaceLevel - 20);

        /* TEST WORLD (size=100,70)
        this.blockGrid = new Array(worldSize.x);
        for (let i = 0; i < worldSize.x; i++) {
            this.blockGrid[i] = new Array(worldSize.y);
            for (let j = 0; j < this.surfaceLevel; j++) {
                this.blockGrid[i][j] = new Block(0);
            }
            for (let j = this.surfaceLevel; j < worldSize.y; j++) {
                if (i<20||j===worldSize.y-1||(i>=20&&j>i-20)) this.blockGrid[i][j] = new Block(j === worldSize.y-1 ? 2 : 1);
                else this.blockGrid[i][j] = new Block(0);
            }
        }
        this.worldSpawn = new AVector(40, 41.25);
        this.blockGrid[3][this.surfaceLevel] = new Block(0);
        this.blockGrid[4][this.surfaceLevel] = new Block(0);
        this.blockGrid[9][this.surfaceLevel-1] = new Block(1);
        this.blockGrid[12][this.surfaceLevel-2] = new Block(1);
        this.blockGrid[12][this.surfaceLevel] = new Block(0);
        this.blockGrid[13][this.surfaceLevel] = new Block(0);
        this.blockGrid[16][this.surfaceLevel-4] = new Block(1);
        for (let i = this.surfaceLevel; i < this.surfaceLevel + 7; i++) {
            this.blockGrid[18][i] = new Block(0);
            this.blockGrid[19][i] = new Block(0);
        }
        this.blockGrid[20][this.surfaceLevel + 4].id = 0;
        this.blockGrid[26][this.surfaceLevel] = new Block(0);
        this.blockGrid[27][this.surfaceLevel] = new Block(0);
        this.blockGrid[27][this.surfaceLevel-1] = new Block(1);
        this.blockGrid[40][this.surfaceLevel+10] = new Block(0);
        this.blockGrid[23][worldSize.y-7] = new Block(2);
        this.blockGrid[24][worldSize.y-7] = new Block(2);
        this.blockGrid[27][worldSize.y-4] = new Block(2);
        this.blockGrid[28][worldSize.y-4] = new Block(2);
        this.blockGrid[29][worldSize.y-4] = new Block(2);
        this.blockGrid[0][10] = new Block(1);
        this.blockGrid[5][5] = new Block(1);*/
    }
}