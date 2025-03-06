import { Fonte } from "./Fonte.js";
import { sincronizar } from "./Sincronizar.js";
import { resetar } from "./Resetar.js";

const fonte = new Fonte();

console.log("classe sensor criada com sucesso...",fonte);

document.getElementById("sincronizar").addEventListener("click", () => {
    sincronizar("fonte");
});

document.getElementById("resetar").addEventListener("click", () => {
    resetar();
});