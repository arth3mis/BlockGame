// LOGIC: blocks are ids [1;BLOCKS_NUMBER], empty is 0, items ]BLOCKS_NUMBER;(BLOCKS_NUMBER+ITEMS_NUMBER)[
const ITEMS_NUMBER = 1;

const itemSprites = new Array(ITEMS_NUMBER);
function loadItemSprites(worldRef, override=false) {  // todo clean access logic by doing todo item in game.js
    let graphicsFile = getChosenGraphicsFile();
    if (graphicsFile === worldRef.loadedGraphics && !override) {  // todo clean access logic by doing todo item in game.js
        return;
    }
    for (let i = 0; i < ITEMS_NUMBER; i++) {
        itemSprites[i] = new Image();
        itemSprites[i].src = resPath + "i" + i + "/" + graphicsFile + resFileType;
    }
}

class Item {
    constructor(id) {
        this.id = id;
        this.stack = 1;
        this.stackMax = 1;
        this.pickaxe = false;
        this.pickaxePowerBase = 1;
        this.pickaxePowerAdd = 0;
        this.toolRangeAdd = 0;
        this.ITEMS();
    }

    getPickaxePower() {  // 100 = 1 block/second
        return (this.pickaxePowerBase + this.pickaxePowerAdd) * 100;
    }

    addToStack() {
        if (this.stack < this.stackMax) {
            this.stack++;
            return true;
        } else {
            return false;
        }
    }

    turnToItem(id) {

    }

    ITEMS() {
        switch (this.id) {
            // empty
            case 0: this.pickaxe = false; this.stackMax = 99; break;
            // pickaxe
            case BLOCKS_NUMBER+1: this.pickaxe = true; this.pickaxePowerAdd = 3; break;
        }
    }
}