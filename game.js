class Game {
    constructor(save=null) {
        this.world = new World(save);

        // todo load player from same file
        this.player = new Player(this.world, save);

        this.drawBlocksH = canvas.width / blockSize;
        this.drawBlocksV = canvas.height / blockSize;
    }

    update(delta) {
        this.world.update(delta, [0,0,1,1]); // todo activebounds could be for foreground animations like terraria butterflies
        this.player.update(delta);
    }

    draw() {
        cx.fillStyle = this.world.background;
        cx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < worldSize.x; i++) {
            for (let j = 0; j < worldSize.y; j++) {
                if (this.world.blockGrid[i][j].id === 1)
                    cx.drawImage(this.world.blockSprite, i * blockSize, j * blockSize, blockSize, blockSize);
            }
        }

        cx.fillStyle = this.player.color;
        cx.beginPath();
        cx.arc(this.player.pos.x * blockSize, this.player.pos.y * blockSize, this.player.radius * blockSize, 0, 2*Math.PI);
        cx.fill();
    }
}