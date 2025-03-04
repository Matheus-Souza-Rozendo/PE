export class FrequencyVisualizer {
    constructor(canvasId, analyser) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = window.innerWidth;
        this.canvas.height = 300;
        this.analyser = analyser;

        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
    }

    draw() {
        requestAnimationFrame(() => this.draw());

        this.analyser.getByteFrequencyData(this.dataArray);

        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const barWidth = (this.canvas.width / this.bufferLength) * 2.5;
        let barHeight;
        let x = 0;
        for (let i = 0; i < this.bufferLength; i++) {
            barHeight = this.dataArray[i];

            const red = (barHeight * 2) % 255;
            const green = 255 - barHeight;
            const blue = barHeight / 2;

            this.ctx.fillStyle = `rgb(${red},${green},${blue})`;
            this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }
    }

    start() {
        this.draw();
    }
    get_dataarray(){
        return this.dataArray;
    }
}
