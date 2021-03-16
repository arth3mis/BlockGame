const canvas = document.getElementById("canvas");
const cx = canvas.getContext("2d");
const resPath = "res/", resFileType = ".png";

// game settings and user options
const timeUnit = 1000;  // 1000 -> speed values etc. are "per second"

const dayLength = 60;  // in seconds resp. timeUnits    day starts at 6:00
const sunrise = [0.9375, 1];      // 4:30 - 6:00
const sunset = [0.5417, 0.6042];  // 19:00 - 20:30
let worldSize = new AVector(100, 70);

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

function sc(a=Number.NaN, /*round=false*/) {
    if (!Number.isNaN(a)) {
        //if (round) {
        //    return Math.round(a * settings.dimScales[settings.dimensionChoice][0] / settings.dimScales[settings.dimensionChoice][1]);
        //}
        return a * settings.dimScales[settings.dimensionChoice][0] / settings.dimScales[settings.dimensionChoice][1];
    }
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
