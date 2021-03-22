class Particle {
    constructor(blockX, blockY, color) {
        this.width = Math.random() * 0.1 + 0.02;
        this.height = Math.random() * 0.1 + 0.02;
        this.color = color;

        this.pos = new AVector(blockX + Math.random(), blockY);
        this.vel = new AVector(Math.random() * 2 - 1, -Math.random() * 2);
        this.accY = 40;
    }

    update(T) {

    }

    draw() {
        cx.fillStyle = this.color;
    }
}


// LOGIC: 0 is air, not included in block BLOCKS_NUMBER, but still the id.
const BLOCKS_NUMBER = 2;  // how many blocks exist

class Block {
    constructor(id) {
        this.id = id;
        this.broken = 0;  // [0;100]
        this.light = 0;
        this.lightEmission = [0, 0];
        this.prevLightEmission = [-1, 0];

        this.useSprite = 0;
        this.particles = [];
        this.BLOCKS();
    }

    break(value) {
        this.broken += value;
        if (this.broken >= 100) {
            this.turnToBlock(0);
        }
        // todo add particles based on value
    }

    turnToBlock(id) {
        this.id = id;
        this.broken = 0;
        this.prevLightEmission = this.lightEmission.slice();
        this.lightEmission = [0, 0];  // standard (overridden by e.g. air)
        this.BLOCKS();
    }

    needsLightingUpdate() {
        for (let i = 0; i < this.lightEmission.length; i++) {
            if (this.lightEmission[i] !== this.prevLightEmission[i]) {
                return true;
            }
        }
        return false;
    }

    setupBlock(particleColors) {
        this.particleColors = particleColors;
    }

    BLOCKS() {
        switch (this.id) {
            // air
            case 0: this.lightEmission = [1, 4]; break;
            // dirt
            case 1: this.setupBlock(["rgb(255,124,39)"]); break;
            // stone
            case 2: this.setupBlock(["rgb(114,46,165)"]); break;
        }
    }
}