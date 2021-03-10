class Game {
    constructor(save=null) {
        this.world = new World(save);

        // todo load player from same file
        this.player = new Player(this.world, save);
        this.playerScreenPos = new AVector(canvas.width/2, canvas.height/2);
    }

    update(delta) {
        this.world.update(delta, [0,0,1,1]); // todo activeBounds could be for foreground animations like terraria butterflies
        this.player.update(delta);

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
        console.log(this.playerScreenPos.x/blockSize)
        for (let i = Math.max(0, Math.floor(this.player.pos.x - this.playerScreenPos.x/blockSize));
             i <= Math.min(worldSize.x-1, Math.floor(this.player.pos.x + (canvas.width-this.playerScreenPos.x)/blockSize)); i++) {
            for (let j = Math.max(0, Math.floor(this.player.pos.y - this.playerScreenPos.y/blockSize));
                 j <= Math.min(worldSize.y-1, Math.floor(this.player.pos.y + (canvas.height-this.playerScreenPos.y)/blockSize)); j++) {
                if (this.world.blockGrid[i][j].id !== 0) {
                    cx.drawImage(this.world.blockSprite[this.world.blockGrid[i][j].id - 1], this.playerScreenPos.x + (i - this.player.pos.x) * blockSize, this.playerScreenPos.y + (j - this.player.pos.y) * blockSize, blockSize, blockSize);
                }
            }
        }

        cx.fillStyle = this.player.color;
        cx.beginPath();
        cx.arc(this.playerScreenPos.x, this.playerScreenPos.y, this.player.radius * blockSize, 0, 2*Math.PI);
        cx.fill();
    }
}