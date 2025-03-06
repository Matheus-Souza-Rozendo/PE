import { AudioProcessor } from "./audioProcessor.js";

export class Fonte{

    constructor(){
        this.processor = new AudioProcessor();
        document.getElementById("startButton").addEventListener("click", () => this.processor.fonte("https://192.168.1.4:3000/pulso.wav"));
        document.getElementById("endButton").addEventListener("click", () => this.processor.pararCaptura());
    }


}