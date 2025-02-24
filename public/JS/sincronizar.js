
const headers = { "Content-Type": "application/json" };

async function sincronizar() {
    try {
      // Captura o horário de envio
      const horarioEnvio = new Date();
  
      // Requisição GET para obter o horário do servidor
      const response = await fetch("http://192.168.1.4:3000/api/horario_servidor", { headers });
      if (!response.ok) {
        document.getElementById('console').innerHTML = "erro na get";
        throw new Error(`Erro na requisição GET: ${response.status}`);
      }
      document.getElementById('console').innerHTML = "passei na get";
      const data = await response.json();
      const dataStr = data.horario_atual;
      if (!dataStr) {
        throw new Error("Campo 'horario_atual' não encontrado na resposta JSON.");
      }
  
      // Converte a string para objeto Date (formato ISO já é interpretado corretamente)
      const horarioServidor = new Date(dataStr);
  
      // Captura o horário de recebimento da resposta
      const horarioRecebimento = new Date();
  
      // Calcula a média entre o envio e o recebimento
      const mediaHorarioTime = horarioEnvio.getTime() + (horarioRecebimento.getTime() - horarioEnvio.getTime()) / 2;
      const mediaHorario = new Date(mediaHorarioTime);
  
      // Calcula o erro (diferença em milissegundos, convertido para microssegundos)
      const erroMicros = (mediaHorario.getTime() - horarioServidor.getTime()) * 1000;
      console.log(`Erro em microssegundos: ${erroMicros} µs`);
  
      // Prepara os dados para enviar via PATCH
      const X = document.getElementById('x').value;
      const Y = document.getElementById('y').value;
      const Tipo = document.getElementById('tipo').value
      const payload = {
        coord_x: parseFloat(X),
        coord_y: parseFloat(Y),
        erro: erroMicros,
        tipo: Tipo
      };
      console.log(payload)
      // Requisição PATCH para atualizar os dados no servidor
      const patchResponse = await fetch("http://192.168.1.4:3000/api/sincronizando", {
        method: "PATCH",
        headers,
        body: JSON.stringify(payload)
      });
      if (!patchResponse.ok) {
        const patchData = await patchResponse.json()
        console.log(patchData)
        document.getElementById('console').innerHTML = JSON.stringify(patchData)
        throw new Error(`Erro na requisição PATCH: ${patchResponse.status}`);
      }
      const patchData = await patchResponse.json();
      document.getElementById('console').innerHTML = JSON.stringify(patchData);
      console.log("Resposta do servidor:", patchData);
      localStorage.setItem('id',patchData['id']);
    } catch (error) {
      console.error("Erro:", error);
    }
  }
  
async function resetar(){
    try {
        localStorage.clear();
        const patchResponse = await fetch("http://192.168.1.4:3000/api/reset", {
            method: "DELETE",
            headers,
          });
          if (!patchResponse.ok) {
            const patchData = await patchResponse.json()
            console.log(patchData)
            throw new Error(`Erro na requisição PATCH: ${patchResponse.status}`);
          }
          const patchData = await patchResponse.json();
          console.log("Resposta do servidor:", patchData);
    } catch (error) {
        console.error("Erro:", error);
    }
}
  

 document.getElementById("sincronizar").addEventListener("click", () => {
    sincronizar();
});

document.getElementById("resetar").addEventListener("click", () => {
    resetar();
});
  