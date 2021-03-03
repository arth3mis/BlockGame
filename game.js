class Game {
    constructor(world=null) {
        this.world = new World(world);
    }

    update() {

    }

    draw() {
        cx.fillStyle = this.world.background;
        cx.fillRect(0, 0, canvas.width, canvas.height);


    }
}