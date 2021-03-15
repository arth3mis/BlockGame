const canvas = document.getElementById("canvas");
const cx = canvas.getContext("2d");
const resPath = "res/", resFileType = ".png";

// user settings
const settings = {
    dimension: new AVector(0,0),
    dimensions: [[1920,1080], [1280,720], [800,600], [640,480]],
    dimScales:  [      [1,1],      [2,3],     [5,9],     [4,9]],
    dimensionChoice: 1,
    fullscreen: false,

    blocksInHeightRange: [17, 54],
    blocksInHeight: 54,
    zoomFactorChoice: 0.5,  // 0 - furthest out; 1 - furthest in (least blocksInHeight)
    worldBlockSpriteSizes: [64, 32, 16],  // used to measure whether graphics are auto
    graphicsRange: ["High", "Mid", "Low", "Auto - higher (recommended)", "Auto - lower"],  // [0:3] equal file names (not case-sensitive)
    graphicsChoice: 3,

    displayFps: true,
}
let noBrowserFullscreenExit = false;

function sc() {
    return settings.dimScales[settings.dimensionChoice][0] / settings.dimScales[settings.dimensionChoice][1];
}

// settings functions
function translateZoom() {
    settings.blocksInHeight = settings.blocksInHeightRange[1] - settings.zoomFactorChoice * (settings.blocksInHeightRange[1] - settings.blocksInHeightRange[0]);
}
translateZoom();

// canvas setup
let canvasPosition;

function setFrameSize() {
    settings.dimension.set(settings.dimensions[settings.dimensionChoice][0], settings.dimensions[settings.dimensionChoice][1]);
    canvas.width = settings.dimension.x;
    canvas.height = settings.dimension.y;
    canvasPosition = canvas.getBoundingClientRect();
}
setFrameSize();
