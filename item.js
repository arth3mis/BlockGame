// LOGIC: blocks are ids [1;BLOCKS_NUMBER], empty is 0, items ]BLOCKS_NUMBER;(BLOCKS_NUMBER+ITEMS_NUMBER)[
const ITEMS_NUMBER = 1;
const INVENTORY_EMPTY = "0";


class Item {
    constructor(id) {
        this.id = id;
        this.standard();
        this.ITEMS();
    }

    standard() {
        this.isBlock = false;
        this.displayName = "x";
        this.stack = 1;
        this.stackMax = 1;
        this.pickaxe = false;
        this.pickaxePowerBase = 1;
        this.pickaxePowerAdd = 0;
        this.toolRangeAdd = 10;
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

    turnToItem(id) {  // todo if set to INVENTORY_EMPTY make it work without ITEMS() as there is no case there
        this.id = id;
        this.standard();
        this.ITEMS();
    }

    setupItem(displayName) {
        this.displayName = displayName;
    }

    ITEMS() {
        if (Object.keys(blockSprites).includes(this.id)) {  // check if item is block
            this.isBlock = true;
        }
        switch (this.id) {
            case "pickaxe": this.setupItem("Pickaxe"); this.pickaxe = true; this.pickaxePowerAdd = 3; break;
        }
    }
}