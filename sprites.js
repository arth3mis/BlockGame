const blockSpritePath = resPath + "blocks/" + "_ID_" + "/" + "_TYPE_" + "/" + "_SIZE_" + resFileType;
const blockDestructionSpritePath = resPath + "bDestroy/" + "_ID_" + "/" + "_SIZE_" + resFileType;
const itemSpritePath = resPath + "items/" + "_ID_" + "/" + "_SIZE_" + resFileType;

let loadedGraphics = null;

const blockSprites = {  // must be distinct from item names as they are searched
    dirt: [new Image(), new Image()],  // for sprite variations
    stone: [new Image()],
    testBlock1: [new Image()],
    testBlock2: [new Image()],
}

const blockDestructionSprites = [new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image()];

const itemSprites = {
    pickaxe: new Image(),
}

function loadGraphics() {
    const graphicsFile = getChosenGraphicsFile();
    if (graphicsFile === loadedGraphics) {  // chosen graphics are already loaded
        return;
    }
    loadedGraphics = graphicsFile;

    for (const blockId in blockSprites) {
        if (blockSprites.hasOwnProperty(blockId)) {
            for (let i = 0; i < blockSprites[blockId].length; i++) {
                blockSprites[blockId][i].src = blockSpritePath
                    .replace("_ID_", blockId)
                    .replace("_TYPE_", i.toString())
                    .replace("_SIZE_", graphicsFile);
            }
        }
    }

    for (let i = 0; i < blockDestructionSprites.length; i++) {
        blockDestructionSprites[i].src = blockDestructionSpritePath
            .replace("_ID_", i.toString())
            .replace("_SIZE_", graphicsFile);
    }

    for (const itemId in itemSprites) {
        if (itemSprites.hasOwnProperty(itemId)) {
            itemSprites[itemId].src = itemSpritePath
                .replace("_ID_", itemId)
                .replace("_SIZE_", graphicsFile);
        }
    }
}

function getChosenGraphicsFile() {  // todo save as variable and update on graphics/blockSize/res change
    let graphicsFile = "error";
    if (settings.graphicsChoice < settings.worldBlockSpriteSizes.length) {
        graphicsFile = settings.graphicsRange[settings.graphicsChoice].toLowerCase();
    } else if (settings.graphicsChoice === settings.worldBlockSpriteSizes.length) {
        graphicsFile = settings.graphicsRange[findClosestSpriteSize(true)].toLowerCase();
    } else if (settings.graphicsChoice === settings.worldBlockSpriteSizes.length + 1) {
        graphicsFile = settings.graphicsRange[findClosestSpriteSize(false)].toLowerCase();
    }
    return graphicsFile;
}
function findClosestSpriteSize(roundUp) {
    for (let i = 0; i < settings.worldBlockSpriteSizes.length; i++) {
        if (blockSize >= settings.worldBlockSpriteSizes[i]) {
            if (i > 0 && roundUp) {
                return i-1;
            } else {
                return i;
            }
        }
    }
    return settings.worldBlockSpriteSizes.length - 1;  // blockSize < settings.worldBlockSpriteSizes[settings.worldBlockSpriteSizes.length - 1]
}