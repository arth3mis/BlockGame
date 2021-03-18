const GAME_VERSION = 0;

const canvas = document.getElementById("canvas");
const cx = canvas.getContext("2d");
const resPath = "res/", resFileType = ".png";

// game settings and user options
const timeUnit = 1000;  // 1000 -> speed values etc. are "per second"

const worldTime = {
    dayLength: 60,  // in seconds resp. timeUnits    day starts at 6:00
    sunrise: [0.9375, 1],      // 4:30 - 6:00
    sunset: [0.5417, 0.6042],  // 19:00 - 20:30
}
let worldSize = new AVector(100, 70);

const settings = {
    dimension: new AVector(0,0),
    dimensions: [[1920,1080], [1280,720], [800,600], [640,480]],
    dimScales:  [      [1,1],      [2,3],     [5,9],     [4,9]],
    dimensionChoice: 0,
    fullscreen: false,

    blocksInHeightRange: [17, 54],
    blocksInHeight: 54,
    zoomFactorChoice: 0.8,  // 0 - furthest out; 1 - furthest in (least blocksInHeight)
    worldBlockSpriteSizes: [64, 32, 16],  // used to measure whether graphics are auto
    graphicsRange: ["High", "Mid", "Low", "Auto - higher (recommended)", "Auto - lower"],  // [0:3] equal file names (not case-sensitive)
    graphicsChoice: 3,

    displayFps: true,
    dropZoneWidth: 100,
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

// world uploading framework
function uploadFile() {
    const element = document.createElement("input");
    element.setAttribute("type", "file");
    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    const input = document.querySelector("input");  // https://www.geeksforgeeks.org/how-to-load-the-contents-of-a-text-file-into-a-javascript-variable/
    input.addEventListener('change', function() {
        let files = input.files;
        if (files.length === 0) return;
        /* If any further modifications have to be made on the
           Extracted text. The text can be accessed using the
           file variable. But since this is const, it is a read
           only variable, hence immutable. To make any changes,
           changing const to var, here and In the reader.onload
           function would be advisable */
        const file = files[0];
        let reader = new FileReader();
        reader.onload = function(e) {
            const file = e.target.result;
            // This is a regular expression to identify carriage
            const lines = file.split(/\r\n|\n/);
            console.log(lines.join("; "))   // TODO use data
            document.body.removeChild(element);
        };
        reader.onerror = (e) => alert(e.target.error.name);
        reader.readAsText(file);
    });
}

// world downloading framework
function downloadFile(filename, text) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

// Start file download.
//downloadFile("hello.txt","This is the content of my file :)");