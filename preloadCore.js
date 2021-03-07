const canvas = document.getElementById("canvas");
const cx = canvas.getContext("2d");
const resPath = "res/";

// user settings
const settings = {
    dimension: new AVector(0,0),
    dimensions: [[1920,1080], [1280,720], [800,600]],
    dimensionChoice: 1,
    fullscreen: false,
    blocksInHeight: 25,
    updatesPerSecond: 60,
    displayFps: true,
}
let noBrowserFullscreenExit = false;

// canvas setup
let canvasPosition = canvas.getBoundingClientRect();
settings.dimension.set(settings.dimensions[settings.dimensionChoice][0], settings.dimensions[settings.dimensionChoice][1]);
canvas.width = settings.dimension.x;
canvas.height = settings.dimension.y;