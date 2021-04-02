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
const BLOCKS_NUMBER = 4;  // how many blocks exist

class Block {
    constructor(id, spriteType=0) {
        this.id = id;
        this.standard();

        // lighting
        this.light = 0;
        this.lightEmission = [0, 0];
        this.prevLightEmission = ["-", 0];  // first element must not be a number

        this.useSprite = spriteType;
        this.particles = [];
        this.BLOCKS();
    }

    standard() {
        this.displayName = "x";
        this.broken = 0;  // [0;100]
        this.breakResistance = 1;
        this.useSprite = 0;
    }

    break(value) {
        this.broken += value / this.breakResistance;
        if (this.broken >= 100) {
            this.turnToBlock("air");
        }
        // todo add particles based on value (/breakResistance?)
    }

    turnToBlock(id) {
        this.id = id;
        this.standard();
        // lighting (keep old values as prev!)
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

    setupBlock(displayName, particleColors) {
        this.displayName = displayName;
        this.particleColors = particleColors;
    }

    BLOCKS() {
        switch (this.id) {
            case "air": this.lightEmission = [1.2, 5]; break;
            case "dirt": this.setupBlock("Dirt", ["rgb(109,73,50)"]); break;
            case "stone": this.setupBlock("Stone", ["rgb(119,119,119)"]); this.breakResistance = 1.8; break;
            case "testBlock1": this.setupBlock("T1", ["rgb(255,124,39)"]); this.breakResistance = 0.3; break;
            case "testBlock2": this.setupBlock("T2", ["rgb(168,54,255)"]); this.breakResistance = 0.8; break;
        }
    }
}