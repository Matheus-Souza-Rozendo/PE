
async function enviarDados() {
    try {
        const agora = new Date()
        const id = localStorage.getItem('id');
        const payload = {
                "id_sensor": parseFloat(id),
                "hora_de_chegada": agora.toISOString()
            }
          console.log(payload)
          // Requisição PATCH para atualizar os dados no servidor
          const Response = await fetch("http://192.168.1.4:3000/api/receber_leitura", {
            method: "POST",
            headers,
            body: JSON.stringify(payload)
          });
          if (!Response.ok) {
            const Data = await Response.json()
            console.log(Data)
            document.getElementById('console').innerHTML = JSON.stringify(Data)
            throw new Error(`Erro na requisição PATCH: ${Response.status}`);
          }
          const Data = await Response.json();
          document.getElementById('console').innerHTML = JSON.stringify(Data);
          console.log("Resposta do servidor:", Data);
    } catch (error) {
        console.error(error)
    }
}

document.getElementById("dados").addEventListener("click", () => {
    enviarDados();
});