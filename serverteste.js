const express = require('express');
const https = require('https');
const os = require('os');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const { json, text } = require('stream/consumers');
const fs = require('fs').promises; 
const fss = require('fs')
const sensor = require('./modulos/Sensor');
const fonte = require('./modulos/Fonte');
const som = require('./modulos/Som');
const arquivoJSON = require('./modulos/ArquivoJSON');
const leitura = require('./modulos/Leitura');

const app = express();
const PORT = 3000;
const caminhoJSON = __dirname + "/dados.JSON";


const options = {
    key: fss.readFileSync('./server.key'), 
    cert: fss.readFileSync('./server.cert') 
};

// Middleware para JSON
app.use(express.json());

// Servir arquivos estáticos da pasta 'public'
app.use(express.static('public'));

// Função para pegar IP local dinamicamente
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const config of iface) {
      if (config.family === 'IPv4' && !config.internal) {
        return config.address;
      }
    }
  }
  return 'localhost';
}

function verificaCampos(campos,dados){
  for(i = 0;i<campos.length;i++){
    if(!(campos[i] in dados)){
      return false;
    }
  }
  return true
}

function isNumber(value) {
  return typeof value === 'number' && !isNaN(value);
}

// Função assíncrona para conectar ao banco de dados
async function conectarBanco() {
  return open({
      filename: 'dados.db',
      driver: sqlite3.Database
  });
}

async function verificarSincronizacao() {
   // Ler o arquivo JSON
   const arquivo = new arquivoJSON(caminhoJSON);
   await arquivo.carregarArquivo()
   let vetor = arquivo.dados['sincronizados_sensor']
   for(i=0;i<vetor.length;i++){
    if(!vetor[i]){
      return false
    }
   }
   return true;
}


async function limparBanco() {
  try {
      const db = await conectarBanco()

      // Apagar todos os registros das tabelas
      await db.run("DELETE FROM Som;");
      await db.run("DELETE FROM Sensor;");
      await db.run("DELETE FROM Fonte;");
      await db.run("DELETE FROM Leitura;");

      // Resetar o autoincremento (sqlite_sequence)
      await db.run("DELETE FROM sqlite_sequence WHERE name='Som';");
      await db.run("DELETE FROM sqlite_sequence WHERE name='Sensor';");
      await db.run("DELETE FROM sqlite_sequence WHERE name='Fonte';");
      await db.run("DELETE FROM sqlite_sequence WHERE name='Leitura';");

      // Liberar espaço no banco
      await db.run("VACUUM;");

      await db.close();
      jsonObj = { "ordem": [0,0,0],
        "sincronizados_fonte": [false],
        "sincronizados_sensor": [false,false,false]
    }
      await fs.writeFile(caminhoJSON,JSON.stringify(jsonObj, null, 4), 'utf8');
      return { success: true, message: "Todas as tabelas foram limpas e os IDs resetados." };
  } catch (err) {
      throw new Error("Erro ao limpar o banco: " + err.message);
  }
}

// Rota PATCH para sincronização
app.patch('/api/sincronizando', async (req, res) => {
  const body = req.body; // Recebe dados do cliente
  const camposEsperados = ["coord_x","coord_y","erro","tipo"];
  if(!verificaCampos(camposEsperados,body)){
    console.log(body);
    return res.status(400).json({ error: "Dados enviados estão incompletos." });
  }
  if(!isNumber(body['coord_x']) || !isNumber(body['coord_y'])){
    return res.status(400).json({ error: "Coordenadas devem ser números reais" });
  }

  if(body["tipo"]!= "sensor" && body["tipo"]!= "fonte"){
    return res.status(400).json({ error: "Tipos aceitos: Fonte e Sensor" });
  }

  const diffUs = body['erro'];
  var id;
  if(body["tipo"]== "sensor"){
    const Sensor = new sensor(body['coord_x'],body['coord_y'],null,diffUs,caminhoJSON);
    await Sensor.SalvarSensor();
    if(Sensor.id==null){
      return res.status(500).json({ error: "Erro Interno - Banco de Dados"});
    }
    id=Sensor.id;
  }

  if(body["tipo"]== "fonte"){
    const Fonte = new fonte(body['coord_x'],body['coord_y'],null,diffUs,caminhoJSON);
    await Fonte.SalvarFonte();
    if(Fonte.id==null){
      return res.status(500).json({ error: "Erro Interno - Banco de Dados"});
    }
    id=Fonte.id;
  }
  return res.status(200).json({ message: "Sincronização bem-sucedida",id:id});

});

// Rota POST para receber os dados da emissão do SOM pela Fonte
app.post('/api/som_enviado', async (req, res) => {
  const body = req.body; // Recebe dados do cliente
  const camposEsperados = ["id_fonte","hora_de_emissao"];
  if(!verificaCampos(camposEsperados,body)){
    return res.status(400).json({ error: "Dados enviados estão incompletos." });
  }
  if(!isNumber(body['id_fonte'])){
    return res.status(400).json({ error: "ID da fonte invalido" });
  }
  const Som = new som(body["id_fonte"],body["hora_de_emissao"],caminhoJSON,null);
  retorno = await Som.salvarSom()
  if(!retorno){
    return res.status(500).json({ error: "Erro Interno - Banco de Dados - JSON"});
  }

  return res.status(200).json({ message: "Som recebido."});
});

// Rota POST para receber os dados da emissão do SOM pela Fonte
app.post('/api/receber_leitura', async (req, res) => {
  try {
    const body = req.body; // Recebe dados do cliente
    const camposEsperados = ["id_sensor", "hora_de_chegada"];

    // Verifica se todos os campos esperados foram enviados
    if (!verificaCampos(camposEsperados, body)) {
      return res.status(400).json({ error: "Dados enviados estão incompletos." });
    }

    // Valida se o id_sensor é um número
    if (!isNumber(body["id_sensor"])) {
      return res.status(400).json({ error: "ID do Sensor inválido" });
    }

    // Verifica sincronização dos sensores
    const sincronizado = await verificarSincronizacao();

    if (sincronizado) {
      const Leitura = new leitura( body["id_sensor"],body["hora_de_chegada"],caminhoJSON,null);
      const retorno = await Leitura.salvarLeitura()

      if (!retorno) {
        return res.status(500).json({ error: "Erro Interno - Banco de Dados - JSON" });
      }

      // Responder ao cliente antes de iniciar o processamento assíncrono
      res.status(200).json({ message: "Leitura recebida e processamento iniciado." });

      // Executar processamento assíncrono sem afetar a resposta HTTP
      setImmediate(() => {
        const Fonte = new fonte(null,null,1,null,caminhoJSON);
        Fonte.calcularposicao()
      });

    } else {
      return res.status(200).json({ message: "Leitura recebida, sensores não sincronizados." });
    }
  } catch (error) {
    console.error("Erro na rota /api/receber_leitura:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// Rota POST para receber os dados da emissão do SOM pela Fonte
app.get('/api/posicao', async (req, res) => {
  try {
      const Fonte = new fonte(null,null,1,null,caminhoJSON);
      const retorno =  await Fonte.carregaPosicao()
      if(!retorno){
        res.status(500).json("erro interno no servidor");
      }
      const Posicao = Fonte.getPosicao();
      return res.status(200).json(Posicao)
  } catch (error) {
    console.error("Erro na rota /api/posicao:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// 🚀 Endpoint DELETE para limpar todas as tabelas
app.delete("/api/reset", async (req , res) => {
  try {
      const resultado = await limparBanco();
      return res.status(200).json(resultado);
  } catch (erro) {
      return res.status(500).json({ error: erro.message });
  }
});

// Rota GET para receber o horario do servidor
app.get('/api/horario_servidor', async (req, res) => {
  try {
    const dataAtual = new Date();
    return res.status(200).json({horario_atual: dataAtual.toISOString()});
  } catch (error) {
    console.error("Erro na rota /api/horario_servidor:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
});


https.createServer(options, app).listen(3000, () => {
    console.log(`acesse via rede local: https://${getLocalIP()}:${PORT}`);
});