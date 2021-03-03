const worldSize = new AVector(2000, 400);
const blockSize = canvas.height / 12.5;

class World {
    constructor(save) {
        if (save == null) {
            this.generate();
        } else {
            this.load();
        }
        this.background = cx.createLinearGradient(0, 0, 0, canvas.height);
        this.background.addColorStop(0, "rgb(157,176,174)");
        this.background.addColorStop(0.4, "rgb(109,121,120)");
        this.background.addColorStop(1, "rgb(86,93,93)");
    }

    load() {

    }

    generate() {
        this.blockGrid = new Array(worldSize.x);
        for (let i = 0; i < worldSize.x; i++) {
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