import { Sensor } from "./Sensor.js";
import { sincronizar } from "./Sincronizar.js";
import { resetar } from "./Resetar.js";

const sensor = new Sensor();

console.log("classe sensor criada com sucesso...",sensor);

document.getElementById("sincronizar").addEventListener("click", () => {
    sincronizar("sensor");
});

document.getElementById("resetar").addEventListener("click", () => {
    resetar();
});