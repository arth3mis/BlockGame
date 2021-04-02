const GAME_VERSION = 13;
const GAME_NAME = "BlockGame";

const canvas = document.getElementById("canvas");
const cx = canvas.getContext("2d");
const resPath = "res/", resFileType = ".png";
const saveFileType = ".block", playerSaveSeparator = "$$$", saveSeparator = ";", saveSeparator2 = "_";

const isOsMac = navigator.platform.toLowerCase().includes("mac");

// game settings and user options
const timeUnit = 1000;  // 1000 -> speed values etc. are "per second"

const gameStates = {
    inGame: "inGame",
    mainMenu: "mainMenu",
    settingsMenu: "settingsMenu",
}

const settings = {
    dimension: new AVector(0,0),
    dimensions: [[3840,2160], [2560,1440], [1920,1080], [1280,720], [960,540], [640,360]],  // 16:9 only (or update text scaling)
    dimScales:  [      [2,1],       [4,3],       [1,1],      [2,3],     [1,2],     [1,3]],
    dimensionChoice: 3,
    fullscreen: false,

    blocksInHeightRange: [17, 30],
    blocksInHeight: 0,
    zoomFactorChoice: 0.8,  // 0 - furthest out; 1 - furthest in (least blocksInHeight)
    uiScaleChoice: 1.6,
    worldBlockSpriteSizes: [64, 32, 16],  // used to measure whether graphics are auto
    graphicsRange: ["High", "Mid", "Low", "Auto - higher (recommended)", "Auto - lower"],  // [0:3] equal file names (not case-sensitive)
    graphicsChoice: 3,

    displayFps: true,
    dropZoneWidth: 100,
}
let noBrowserFullscreenExit = false;

function sc(a=Number.NaN, manualScale=1) {
    if (!Number.isNaN(a)) {
        //if (round) {
        //    return Math.round(a * settings.dimScales[settings.dimensionChoice][0] / settings.dimScales[settings.dimensionChoice][1]);
        //}
        return a * manualScale * settings.dimScales[settings.dimensionChoice][0] / settings.dimScales[settings.dimensionChoice][1];
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
        if (files.length === 0) {
            return;
        }
        const file = files[0];
        if (!file.name.includes(saveFileType)) {
            alert("File must be of '"+saveFileType+"' type!");
            return;
        }
        let reader = new FileReader();
        reader.onload = function(e) {
            const fileContent = e.target.result;
            const lines = fileContent.split(/\r\n|\n/);  // Regex to identify carriage

            if (!checkSaveFile(lines[0])) {
                alert("File (version "+lines[0]+") is older than lowest supported version ("+saveFileLowestSupportedVersion+")");
            } else {
                lines.unshift(file.name);
                initGame(lines);
            }

            document.body.removeChild(element);
        };
        reader.onerror = function (e) {
            document.body.removeChild(element);
            alert(e.target.error.name);
        };
        reader.readAsText(file);
    });
}

// world downloading framework
function downloadFile(filename, text) {  // https://ourcodeworld.com/articles/read/189/how-to-create-a-file-and-generate-a-download-with-javascript-in-the-browser-without-a-server
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}