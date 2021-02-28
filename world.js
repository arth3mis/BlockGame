const worldSize = new AVector(2000, 400);
const blockSize = canvas.height / 12.5;

class World {
    constructor(save) {
        if (save == null) {
            this.generate();
        } else {
            this.load();
        }
        this.background = 0;
    }

    load() {

    }

    generate() {
        this.blockGrid = new Array(worldSize.x);
        for (let i = 0; i < this.blockGrid.length; i++) {
            this.blockGrid[i] = new Array(worldSize.y);
            for (let j = 0; j < worldSize.y * 0.25; j++) {
                this.blockGrid[i][j] = new Block(0);
            }
            for (let j = worldSize.y * 0.25; j < worldSize.y; j++) {
                this.blockGrid[i][j] = new Block(1);
            }
        }
    }
}