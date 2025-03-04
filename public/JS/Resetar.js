import { Terminal } from "./Terminal.js";
const terminal = new Terminal('terminal');

export async function resetar(){
    try {
        localStorage.clear();
        const patchResponse = await fetch("https://192.168.1.4:3000/api/reset", {
            method: "DELETE",
            headers: {"Content-Type": "application/json" },
          });
          if (!patchResponse.ok) {
            const patchData = await patchResponse.json()
            console.log(patchData)
            terminal.show('erro ao resetar');
            throw new Error(`Erro na requisição PATCH: ${patchResponse.status}`);
          }
          const patchData = await patchResponse.json();
          console.log("Resposta do servidor:", patchData);
          terminal.show('reset com sucesso');
    } catch (error) {
        console.error("Erro:", error);
    }
}