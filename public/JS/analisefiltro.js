import { AudioProcessor } from "./audioProcessor.js";

const processor = new AudioProcessor("canvasBefore", "canvasAfter");

document.getElementById("startButton").addEventListener("click", () => processor.analisarFiltro());
