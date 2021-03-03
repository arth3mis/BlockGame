class Player {
    constructor(worldRef, save) {
        this.wld = worldRef;

        this.pos = new AVector(8, 4);
        this.vel = new AVector(0, 0);
        this.acc = new AVector(0, 13);

        this.accLR = 15;
        this.maxVelX = 3;

        this.jumpVel = -8;
        this.jumped = false;
        this.inAir = false;
        this.accXFactorInAir = 0.7;
        this.brakeXFactorInAir = 0.25;

        this.radius = 0.75;

        this.color = "rgb(94,248,245)"
        //this.colorH = 0;
        //this.color = "hsl(0,70%,55%)";
        //this.colorCycleTime = 20;

        //this.timeLastUpdate = 0;
    }

    update(delta) {
        const T = delta / timeUnit;
        //this.colorH = (this.colorH + 360/this.colorCycleTime * delta/tickLength) % 360;
        //this.color = "hsl("+Math.round(this.colorH)+",70%,55%)"

        // movement
        this.vel.add(AVector.mult(this.acc, T * (this.inAir ? this.accXFactorInAir : 1), T));
        if (this.acc.x === 0) {
            let sign = Math.sign(this.vel.x);
            this.vel.add(this.accLR * T * -sign * (this.inAir ? this.brakeXFactorInAir : 1), 0);
            if (Math.sign(this.vel.x) !== sign) {
                this.vel.setX(0);
            }
        }
        this.vel.limitX(this.maxVelX);

        this.pos.add(AVector.mult(this.vel, T));

        // collision
        // y
        if (this.pos.x - this.radius < 0) {
            this.pos.setX(this.radius);
            this.vel.setX(0);
        } else if (this.pos.x + this.radius > worldSize.x) {
            this.pos.setX(worldSize.x - this.radius);
            this.vel.setX(0);
        }
        // y
        let blockBelow = Math.round(this.pos.y + this.radius);
        if (this.wld.blockGrid[Math.round(this.pos.x - 0.5)][blockBelow].id !== 0) {
            if (this.pos.y + this.radius > blockBelow) {
                this.pos.setY(blockBelow - this.radius);
                this.vel.setY(0);
                this.jumped = false;
                this.inAir = false;
            }
        } else if (this.pos.y - this.radius < 0) {
            this.pos.setY(this.radius);
        }
    }
}