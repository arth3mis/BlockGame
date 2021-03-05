class Player {
    constructor(worldRef, save) {
        this.wld = worldRef;

        this.gravity = 50;

        this.pos = new AVector(8, 4);
        this.vel = new AVector(0, 0);
        this.acc = new AVector(0, this.gravity);

        this.accLR = 15;
        this.maxVelX = 9;
        this.brakeXFactor = 3.5;
        this.accXFactorInAir = 0.7;
        this.brakeXFactorInAir = 1;
        this.velEdgePushFactor = 2;

        this.jumpVel = -12;
        this.jumpTime = 0;
        this.jumpTimeout = 300;
        this.jumping = false;
        this.jumped = false;
        this.inAir = false;
        this.maxVelFall = 30;

        this.radius = 0.75;

        this.color = "rgb(94,248,245)"
        //this.colorH = 0;
        //this.color = "hsl(0,70%,55%)";
        //this.colorCycleTime = 20;
    }

    update(delta) {
        const T = delta / timeUnit;
        //this.colorH = (this.colorH + 360/this.colorCycleTime * delta/tickLength) % 360;
        //this.color = "hsl("+Math.round(this.colorH)+",70%,55%)"

        // movement
        this.vel.add(AVector.mult(this.acc, T * (this.inAir ? this.accXFactorInAir : 1), T));
        // braking
        let sign = Math.sign(this.vel.x);
        if (sign !== Math.sign(this.acc.x)) {
            this.vel.add(this.accLR * T * -sign * (this.inAir ? this.brakeXFactorInAir : this.brakeXFactor), 0);
            if (Math.sign(this.vel.x) !== sign) {
                this.vel.setX(0);
            }
        }
        this.vel.limitX(this.maxVelX);
        // jumping
        if (this.jumping && gameTime - this.jumpTime < this.jumpTimeout) {
            this.vel.setY(this.jumpVel);
        }
        if (this.vel.y > this.maxVelFall) {
            this.vel.y = this.maxVelFall;
        }

        this.pos.add(AVector.mult(this.vel, T));

        // collision
        // x
        if (this.pos.x - this.radius < 0) {
            this.pos.setX(this.radius);
            this.vel.setX(0);
        } else if (this.pos.x + this.radius > worldSize.x) {
            this.pos.setX(worldSize.x - this.radius);
            this.vel.setX(0);
        } else {
//            // left block
//            let blockLeftX = Math.round(this.pos.x - this.radius) - 1;
//            if (blockLeftX >= 0 && this.wld.blockGrid[blockLeftX][Math.floor(this.pos.y)].id !== 0) {
//                if (this.pos.x - this.radius <= blockLeftX + 1) {
//                    this.stopX(blockLeftX + 1 + this.radius);
//                }
//            } /*else if (blockLeftX >= 0) {
//                let xRange = [Math.floor(this.pos.x - this.radius), Math.floor(this.pos.x + this.radius)];
//                for (let i = xRange[0]; i <= xRange[1]; i++) {
//                    if (this.wld.blockGrid[i][blockBelowY].id !== 0) {
//                        // check where player hits a corner, get yDiff between pos.y and y of corner
//                        let xDiff = this.pos.x - i - (i < this.pos.x ? 1 : 0);
//                        let yDiff = Math.sqrt(this.radius * this.radius - xDiff * xDiff);
//                        if (this.pos.y + yDiff > blockBelowY) {
//                            this.stopX(blockBelowY - yDiff);
//                        }
//                    }
//                }
//            }*/ else {
//                // right block
//                let blockRightX = Math.round(this.pos.x + this.radius);
//                if (blockRightX < worldSize.x && this.wld.blockGrid[blockRightX][Math.floor(this.pos.y)].id !== 0) {
//                    if (this.pos.x + this.radius >= blockRightX) {
//                        this.stopX(blockRightX - this.radius);
//                    }
//                } /*else if (blockRightX < worldSize.x) {
//                    let yRange = [Math.floor(this.pos.y - this.radius), Math.floor(this.pos.y + this.radius)];
//                    for (let i = yRange[0]; i <= yRange[1]; i++) {
//                        if (i >= 0 && i < worldSize.y && this.wld.blockGrid[blockRightX][i].id !== 0) {
//                            // check where player hits a corner, get xDiff between pos.x and x of corner
//                            let yDiff = this.pos.y - i - (i < this.pos.y ? 1 : 0);
//                            let xDiff = Math.sqrt(this.radius * this.radius - yDiff * yDiff);
//                            if (this.pos.x + xDiff > blockRightX) {
//                                this.stopX(blockRightX - xDiff);
//                            }
//                        }
//                    }
//                }*/
//            }
        }
        // y
        this.inAir = true;
        if (this.pos.y + this.radius > worldSize.y) {
            this.stopY(worldSize.y - this.radius);
        } else if (this.pos.y - this.radius < 0) {
            this.pos.setY(this.radius);
        } else {
            // top block
            let blockTopY = Math.round(this.pos.y - this.radius) - 1;
            if (blockTopY >= 0 && this.wld.blockGrid[Math.floor(this.pos.x)][blockTopY].id !== 0) {
                if (this.pos.y - this.radius <= blockTopY + 1) {
                    this.stopY(blockTopY + 1 + this.radius, true);
                }
            } /*else if (blockTopY >= 0) {
                let xRange = [Math.floor(this.pos.x - this.radius), Math.floor(this.pos.x + this.radius)];
                for (let i = xRange[0]; i <= xRange[1]; i++) {
                    if (i >= 0 && i < worldSize.x && this.wld.blockGrid[i][blockTopY].id !== 0) {
                        // check where player hits a corner, get yDiff between pos.y and y of corner
                        let xDiff = this.pos.x - i - (i < this.pos.x ? 1 : 0);
                        let yDiff = Math.sqrt(this.radius * this.radius - xDiff * xDiff);
                        if (this.pos.y - yDiff <= blockTopY) {
                            this.stopY(blockTopY + yDiff);
                        }
                    }
                }
            }*/ else {
                // bottom block
                let blockBottomY = Math.round(this.pos.y + this.radius);
                if (blockBottomY < worldSize.y && this.wld.blockGrid[Math.floor(this.pos.x)][blockBottomY].id !== 0) {
                    if (this.pos.y + this.radius >= blockBottomY) {
                        this.stopY(blockBottomY - this.radius);
                    }
                } else if (blockBottomY < worldSize.y) {
                    let xRange = [Math.floor(this.pos.x - this.radius), Math.floor(this.pos.x + this.radius)];
                    for (let i = xRange[0]; i <= xRange[1]; i++) {
                        if (i >= 0 && i < worldSize.x && this.wld.blockGrid[i][blockBottomY].id !== 0) {
                            // check where player hits a corner, get yDiff between pos.y and y of corner
                            let xDiff = this.pos.x - i - (i < this.pos.x ? 1 : 0);
                            let yDiff = Math.sqrt(this.radius * this.radius - xDiff * xDiff);
                            if (this.pos.y + yDiff >= blockBottomY) {
                                this.stopY(blockBottomY - yDiff);
                                if (Math.abs(xDiff) > this.radius / 2) {
                                    //this.vel.add(xDiff * this.velEdgePushFactor, 0);  todo dev re-add after finding land glitch bug
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    stopX(xPos) {
        this.pos.setX(xPos);
        this.vel.setX(0);
    }

    stopY(yPos, hitTop=false) {
        this.pos.setY(yPos);
        this.vel.setY(0);
        if (hitTop) {
            this.jumping = false;
        } else {
            this.jumped = false;
            this.inAir = false;
        }
    }
}