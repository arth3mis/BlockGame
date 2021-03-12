class Settings {
    constructor() {
        this.heightP = 0.7;  // percentage of dimension height
        this.widthP = 0.8;  // percentage of heightP

        this.stdButtonScale = new AVector(0.6, 0.2);  // percentage of this.size
        this.dimensionButton = [0, 1, 1];  // position, xScale, yScale
    }

    update(delta) {
        if (mouse.lmbTriggered) {
            if (mouse.lmbTriggerPos.y > canvas.height/2) {
                settings.dimensionChoice = 0;
            } else {
                settings.dimensionChoice = 1;
            }
            setFrameSize();
            updateBlockSize();
            mouse.lmbTriggered = false;
        }
    }

    draw() {
        let xm = canvas.width / 2;
        let ym = canvas.height / 2;
        let h = canvas.height * this.heightP;
        let w = h * this.widthP;

        cx.lineWidth = 25;
        cx.strokeStyle = "rgb(37,60,74)";
        cx.fillStyle = "rgb(63,136,176)";
        cx.beginPath();
        cx.moveTo(xm - w/2, ym - h/2);
        cx.lineTo(xm + w/2, ym - h/2);
        cx.lineTo(xm + w/2, ym + h/2);
        cx.lineTo(xm - w/2, ym + h/2);
        cx.lineTo(xm - w/2, ym - h/2 - cx.lineWidth/2);
        cx.stroke();
        cx.fill();
    }
}