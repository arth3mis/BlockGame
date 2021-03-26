class Player {
    constructor(worldRef, save) {
        this.wld = worldRef;

        this.radius = 0.75;  // must be ]0.5;1] (collision is not fail-proof for every size) -> radii over 1 work pretty well, only need to fix x collision

        this.gravity = 60;

        this.pos = this.wld.worldSpawn.clone().sub(0, this.radius);
        this.vel = new AVector(0, 0);
        this.acc = new AVector(0, this.gravity);

        // x movement
        this.accLR = 16;
        this.maxVelX = 10;
        this.brakeXFactor = 2;
        this.accXFactorInAir = 0.7;
        this.brakeXFactorInAir = 1;

        this.edgePush = 0;
        this.edgePushFactor = 2;
        this.edgePushThreshold = 0.01;

        // y movement
        this.maxVelFall = 30;
        this.hitTopVelLimit = 10;

        // jumping (how high player can jump is determined by jumpVel && jumpTimeout)
        // settings
        this.jumpVel = -12;  // jump velocity
        this.jumpTimeout = 0.3 * timeUnit;  // jump duration
        this.inAirJumpDelay = 0.15 * timeUnit;  // can still jump after this time in air
        this.autoJump = false;
        this.jumpsPossible = 1;
        this.followUpJumpsStrengthFactor = 0.9;

        // calculation variables
        this.jumpTime = 0;
        this.jumping = false;  // keyboard holding for height
        this.firstJumped = false;
        this.jumpTriggerNeeded = false;  // waits for keyboard to trigger jump again (used when !autoJump)
        this.jumpsTriggered = 0;  // goes up with keyboard presses
        this.jumpsDone = 0;  // actually started jumps
        this.inAir = false;
        this.inAirStart = 0;

        // building/breaking
        this.range = [4, 3, 5];  // top, bottom, LR

        this.color = "rgb(94,248,245)";
        //this.colorH = 0;
        //this.color = "hsl(0,70%,55%)";
        //this.colorCycleTime = 20;

        this.upgradeRules = {
            addMaxVelXSteps: 1,
            addMaxVelXMax: 5,  // max steps
            addJumpsMax: 3,
            addJumpVelSteps: -1,
            addJumpVelMax: 5,  // max steps
            addPlaceRangeMax: 5,
        }
        this.upgrades = {  // todo apply
            addMaxVelX: 0,  // steps
            autoJump: false,
            addJumpsPossible: 0,
            addJumpVel: 0,  // steps
            addPlaceRange: 10,
        }

        this.hotbarSelection = 0;
        this.inventory = new Array(10);  // columns
        for (let i = 0; i < this.inventory.length; i++) {
            this.inventory[i] = new Array(5);  // rows (row 0 is hotbar)
        }

        if (save != null) {
            this.load(save);
        } else {
            // zero out inventory
            for (let i = 0; i < this.inventory.length; i++) {
                for (let j = 0; j < this.inventory[i].length; j++) {
                    this.inventory[i][j] = new Item(0);
                }
            }
            // generate player equipment
            this.inventory[0][0] = new Item(BLOCKS_NUMBER+1);
            this.inventory[1][0] = new Item(1);
            this.inventory[2][0] = new Item(2);
            this.inventory[3][0] = new Item(3);
            this.inventory[4][0] = new Item(4);
        }
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
        if (keyboard.jump && (this.autoJump || !this.jumpTriggerNeeded)) {
            // start jump from ground
            if (!this.firstJumped && (!this.inAir || gameTime - this.inAirStart < this.inAirJumpDelay)) {
                this.startFirstJump();
            }
            // start jump if possible and if keyboard triggered again
            if (this.inAir && this.jumpsTriggered > this.jumpsDone && this.jumpsDone < this.jumpsPossible) {
                if (this.jumpsDone === 0) {
                    // walked into air, simulate first jump
                    this.jumpsTriggered++;
                    this.jumpsDone = 1;
                }
                // start jump if still possible
                if (this.jumpsDone < this.jumpsPossible) {
                    this.startJump();
                }
            }
            // jump while holding jump button
            if (this.jumping && gameTime - this.jumpTime < this.jumpTimeout * (this.jumpsDone > 1 ? this.followUpJumpsStrengthFactor : 1)) {
                this.vel.setY(this.jumpVel * (this.jumpsDone > 1 ? this.followUpJumpsStrengthFactor : 1));
            }
        }

        // brake fall
        if (this.vel.y > this.maxVelFall) {
            this.vel.y = this.maxVelFall;
        }

        // update position
        let prePos = this.pos.clone();  // to detect movement direction and block skipping in collision calculation
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
            this.inAir = false;
            this.inAirStart = -1;
            this.firstJumped = false;
            this.jumpsDone = 0;
            this.jumpsTriggered = 0;
            this.jumpTriggerNeeded = true;
        }
    }

    startJump() {
        this.jumpsDone++;
        this.jumping = true;
        this.jumpTime = gameTime;
    }

    startFirstJump() {
        this.startJump();
        if (this.autoJump) {
            this.jumpsTriggered = 1;  // simulate keyboard trigger (needed for double jump mechanic)
        }
        this.firstJumped = true;
    }


    load(save) {
        let l = 0;
        let s;
        // inventory
        for (let i = 0; i < this.inventory.length; i++) {
            s = save[l++].split(saveSeparator);
            for (let j = 0; j < this.inventory[i].length; j++) {
                this.inventory[i][j] = new Item(parseInt(s[j]));
            }
        }
        // upgrades
        this.upgrades.addMaxVelX = parseInt(save[l++]);
        this.upgrades.autoJump = (save[l++] === "true");
        this.upgrades.addJumpsPossible = parseInt(save[l++]);
        this.upgrades.addJumpVel = parseInt(save[l++]);
        this.upgrades.addPlaceRange = parseInt(save[l++]);
    }

    save() {
        let s = playerSaveSeparator +"\n";
        // inventory
        for (let i = 0; i < this.inventory.length; i++) {
            for (let j = 0; j < this.inventory[i].length; j++) {
                s += this.inventory[i][j].id + saveSeparator;
            }
            s += "\n";
        }
        // upgrades
        for (const u in this.upgrades) {
            if (this.upgrades.hasOwnProperty(u))
                s += this.upgrades[u] +"\n";
        }
        return s;
    }
}