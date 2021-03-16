class Player {
    constructor(worldRef, save) {
        this.wld = worldRef;

        this.gravity = 50;

        this.pos = new AVector(40, 30);
        this.vel = new AVector(0, 0);
        this.acc = new AVector(0, this.gravity);

        this.accLR = 16;
        this.maxVelX = 10;
        this.brakeXFactor = 2;
        this.accXFactorInAir = 0.7;
        this.brakeXFactorInAir = 1;

        this.edgePush = 0;
        this.edgePushFactor = 2;
        this.edgePushThreshold = 0.1;

        this.jumpVel = -15;
        this.jumpTime = 0;
        this.jumpTimeout = 0.3 * timeUnit;
        this.jumping = false;
        this.jumped = false;
        this.firstJumped = false;
        this.inAir = false;
        this.inAirStart = 0;
        this.inAirJumpDelay = 0.07 * timeUnit;

        this.maxVelFall = 30;
        this.hitTopVelLimit = 10;

        this.radius = 0.75;  // must be below 1 (collision is not fail-proof for every size)

        this.color = "rgb(94,248,245)"
        //this.colorH = 0;
        //this.color = "hsl(0,70%,55%)";
        //this.colorCycleTime = 20;
    }

    update(T) {
        //this.colorH = (this.colorH + 360/this.colorCycleTime * T) % 360;
        //this.color = "hsl("+Math.round(this.colorH)+",70%,55%)"

        // movement
        this.vel.add(AVector.mult(this.acc, T * (this.inAir ? this.accXFactorInAir : 1), T));

        // brake x
        let sign = Math.sign(this.vel.x);
        if (sign !== Math.sign(this.acc.x)) {
            this.vel.add(this.accLR * T * -sign * (this.inAir ? this.brakeXFactorInAir : this.brakeXFactor), 0);
            if (Math.sign(this.vel.x) !== sign) {
                this.vel.setX(0);
            }
        }
        this.vel.limitX(this.maxVelX);

        // push off edge
        if (!keyboard.moveLeft && !keyboard.moveRight && Math.abs(this.edgePush / this.edgePushFactor) > this.edgePushThreshold) {
            this.vel.add(this.edgePush, Math.abs(this.edgePush));
        }
        this.edgePush = 0;

        // jumping
        if (this.jumping && gameTime - this.jumpTime < this.jumpTimeout) {
            this.vel.setY(this.jumpVel);
        }

        // brake fall
        if (this.vel.y > this.maxVelFall) {
            this.vel.y = this.maxVelFall;
        }

        let prePos = this.pos.clone();
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
            // block right of player
            let midYBlocks = [Math.floor(prePos.x + this.radius), Math.floor(this.pos.x + this.radius)];
            // go from right to left to put player as left as possible (esp. if they skipped blocks)
            for (let xBlock = Math.max(midYBlocks[1], midYBlocks[0]); xBlock >= Math.min(midYBlocks[0], midYBlocks[1]); xBlock--) {
                if (0 <= xBlock && xBlock < worldSize.x) {
                    let yBlock = Math.floor(this.pos.y);
                    if (this.collisionX(xBlock, yBlock, true)) {
                        if (xBlock - this.pos.x <= this.radius) {
                            this.stopX(xBlock - this.radius);
                        }
                    }
                }
            }
            // block left of player
            midYBlocks = [Math.floor(prePos.x - this.radius), Math.floor(this.pos.x - this.radius)];
            for (let xBlock = Math.min(midYBlocks[1], midYBlocks[0]); xBlock <= Math.max(midYBlocks[0], midYBlocks[1]); xBlock++) {
                if (0 <= xBlock && xBlock < worldSize.x) {
                    let yBlock = Math.min(worldSize.y-1, Math.max(0, Math.floor(this.pos.y)));
                    if (this.collisionX(xBlock, yBlock, false)) {
                        if (this.pos.x - xBlock - 1 <= this.radius) {
                            this.stopX(xBlock + 1 + this.radius);
                        }
                    }
                }
            }
        }

        // y
        this.inAir = true;
        if (this.pos.y + this.radius > worldSize.y) {
            this.stopY(worldSize.y - this.radius);
        } else if (this.pos.y - this.radius < 0) {
            this.pos.setY(this.radius);
            this.vel.limitY(this.hitTopVelLimit);
        } else {
            let bStop = -1, tStop = -1;
            // block directly below player
            let midXBlocks = [Math.ceil(prePos.y + this.radius), Math.floor(this.pos.y + this.radius)];
            // go from bottom to top to put player as high as possible (esp. if they skipped blocks)
            for (let yBlock = Math.max(midXBlocks[1], midXBlocks[0]); yBlock >= Math.min(midXBlocks[0], midXBlocks[1]); yBlock--) {
                if (0 <= yBlock && yBlock < worldSize.y) {
                    if (this.wld.blockGrid[Math.floor(this.pos.x)][yBlock].id !== 0) {
                        if (yBlock - this.pos.y <= this.radius) {
                            bStop = yBlock - this.radius;
                        }
                    }
                }
            }
            // block directly above player
            midXBlocks = [Math.ceil(prePos.y - this.radius), Math.floor(this.pos.y - this.radius)];
            for (let yBlock = Math.min(midXBlocks[1], midXBlocks[0]); yBlock <= Math.max(midXBlocks[0], midXBlocks[1]); yBlock++) {
                if (0 <= yBlock && yBlock < worldSize.y && this.wld.blockGrid[Math.floor(this.pos.x)][yBlock].id !== 0) {
                    if (this.pos.y - yBlock - 1 <= this.radius) {
                        tStop = yBlock + 1 + this.radius;
                    }
                }
            }
            // circle collision
            let xRange = [Math.floor(prePos.x - this.radius), Math.floor(this.pos.x + this.radius)];
            let yRange = [Math.floor(prePos.y - this.radius), Math.floor(this.pos.y + this.radius)];
            for (let xBlock = xRange[0]; xBlock <= xRange[1]; xBlock++) {
                if (0 <= xBlock && xBlock < worldSize.x) {
                    for (let yBlock = yRange[1]; yBlock >= yRange[0]; yBlock--) {
                        if (0 <= yBlock && yBlock < worldSize.y) {
                            if (this.wld.blockGrid[xBlock][yBlock].id !== 0) {
                                let xDiff = this.pos.x - xBlock - (xBlock < this.pos.x ? 1 : 0);
                                let yDiff = Math.sqrt(this.radius * this.radius - xDiff * xDiff);
                                let top = prePos.y > this.pos.y;
                                if (Math.abs(this.pos.y - yBlock - (top ? 1 : 0)) < yDiff) {
                                    this.stopY(yBlock - yDiff * (top ? -1 : 1) + (top ? 1 : 0), top);
                                    if (Math.abs(xDiff) > this.radius / 5) {
                                        this.edgePush += xDiff * this.edgePushFactor;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (bStop !== -1) {
                this.stopY(bStop);
                this.edgePush = 0;
            }
            if (tStop !== -1) {
                this.stopY(tStop, true);
            }
        }

        if (this.inAir && this.inAirStart === -1) {
            this.inAirStart = gameTime;
        }
    }

    collisionX(x, y, toRight) {
        if (y <= 0) {
            return this.wld.blockGrid[x][0].id !== 0 || this.wld.blockGrid[x][1].id !== 0;
        }
        if (0 < y && y < worldSize.y - 1) {
            if (this.wld.blockGrid[x][y].id !== 0) {    // O☐   case a
                //console.log("a")
                return true;
            } else if (this.wld.blockGrid[x][y-1].id !== 0) {
                if (this.wld.blockGrid[x + (toRight ? -1 : 1)][y+1].id !== 0) {     //  ☐ y-1   case b1
                    //console.log("b1")                                             // O
                    return true;                                                    // ☐ x-1 (if toRight)
                } else if (this.wld.blockGrid[x][y+1].id !== 0) {   //  ☐ y-1   case b2
                    //console.log("b2")                             // O
                    return true;                                    //  ☐ y+1
                }
            } else if (this.wld.blockGrid[x][y+1].id !== 0 && this.wld.blockGrid[x + (toRight ? -1 : 1)][y-1].id !== 0) {   // case b1 with reverse y
                return true;
            }
        }
        if (y >= worldSize.y - 1) {
            return this.wld.blockGrid[x][worldSize.y-1].id !== 0 || this.wld.blockGrid[x][worldSize.y-2].id !== 0;
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
            this.firstJumped = false;
            this.inAir = false;
            this.inAirStart = -1;
        }
    }
}