import { AudioProcessor } from "./audioProcessor.js";

export class Sensor{

    constructor(){
        this.processor = new AudioProcessor();
        document.getElementById("startButton").addEventListener("click", () => this.processor.sensor());
        document.getElementById("endButton").addEventListener("click", () => this.processor.pararCaptura());
    }

    

}

