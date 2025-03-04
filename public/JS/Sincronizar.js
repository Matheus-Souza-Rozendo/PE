import { Terminal } from "./Terminal.js";
const terminal = new Terminal('terminal');

export async function sincronizar(Tipo) {
    try {
      // Captura o horário de envio
      const horarioEnvio = new Date();
  
      // Requisição GET para obter o horário do servidor
      const response = await fetch("https://192.168.1.4:3000/api/horario_servidor");
      if (!response.ok) {
        throw new Error(`Erro na requisição GET: ${response.status}`);
      }

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
  
      // Prepara os dados para enviar via PATCH
      const X = document.getElementById('x').value;
      const Y = document.getElementById('y').value;
      const payload = {
        coord_x: parseFloat(X),
        coord_y: parseFloat(Y),
        erro: erroMicros,
        tipo: Tipo
      };
      console.log(JSON.stringify(payload))
      // Requisição PATCH para atualizar os dados no servidor
      const patchResponse = await fetch("https://192.168.1.4:3000/api/sincronizando", {
        method: "PATCH",
        headers: {"Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!patchResponse.ok) {
        const patchData = await patchResponse.json()
        console.log(patchData)
        terminal.show("erro na sincronização");
        throw new Error(`Erro na requisição PATCH: ${patchResponse.status}`);
      }
      const patchData = await patchResponse.json();
      
      console.log("Resposta do servidor:", patchData);
      terminal.show('sincronização bem sucedida');
      localStorage.setItem('id',patchData['id']);
    } catch (error) {
      console.error("Erro:", error);
    }
  }