const express = require('express');
const os = require('os');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const { json, text } = require('stream/consumers');
const fs = require('fs').promises; 

const app = express();
const PORT = 3000;
const caminhoJSON = __dirname + "/dados.JSON";
const velocidadeSom = 343;

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

function isValidDate(value) {
  return value instanceof Date && !isNaN(value.getTime());
}

// Função assíncrona para conectar ao banco de dados
async function conectarBanco() {
  return open({
      filename: 'dados.db',
      driver: sqlite3.Database
  });
}

// Função assíncrona para inserir um novo sensor
async function inserirSensor(coord_x, coord_y, error_time) {
  try {
      const db = await conectarBanco();
      const sql = `INSERT INTO Sensor (coord_x, coord_y, error_time) VALUES (?, ?, ?)`;
      
      const result = await db.run(sql, [coord_x, coord_y, error_time]);
      await db.close();
      return result.lastID;
      
  } catch (err) {
      console.error('Erro ao inserir sensor:', err.message);
      return false;
  }
}

async function inserirFonte(coord_x, coord_y, error_time) {
  try {
      const db = await conectarBanco();
      const sql = `INSERT INTO Fonte (coord_x, coord_y, error_time) VALUES (?, ?, ?)`;
      
      const result = await db.run(sql, [coord_x, coord_y, error_time]);
      await db.close();
      return result.lastID;
      
  } catch (err) {
      console.error('Erro ao inserir sensor:', err.message);
      return false;
  }
}

async function inserirSom(horario,id_fonte) {
  try {
      const db = await conectarBanco();
      const sql = `INSERT INTO Som (horario, id_fonte) VALUES ( ?, ?)`;
      
      await db.run(sql, [horario,id_fonte]);
      await db.close();
      return true;
      
  } catch (err) {
      console.error('Erro ao inserir sensor:', err.message);
      return false;
  }
}

async function inserirLeitura(horario,id_sensor) {
  try {
      const db = await conectarBanco();
      const ordem = await pegarOrdem(id_sensor);
      const sql = `INSERT INTO Leitura (tempo_de_chegada,id_sensor,id_fonte,ordem) VALUES ( ?, ?, 1, ?)`;
      
      await db.run(sql, [horario,id_sensor,ordem+1]);
      await db.close();
      
      return await atualizarOrdem(id_sensor);
      
  } catch (err) {
      console.error('Erro ao inserir sensor:', err.message);
      return false;
  }
}

async function pegarOrdem(id_sensor) {
  try {
    // Ler o arquivo JSON
    const dados = await fs.readFile(caminhoJSON, 'utf8');
    let jsonObj = JSON.parse(dados);
    
    return jsonObj['ordem'][id_sensor-1];
  } catch (err) {
    console.error('Erro ao modificar o JSON:', err);
    return false;
}
}

async function atualizarOrdem(id_sensor) {
  try {
    // Ler o arquivo JSON
    const dados = await fs.readFile(caminhoJSON, 'utf8');
    let jsonObj = JSON.parse(dados);
    
    jsonObj['ordem'][id_sensor-1]++;

    // Salvar as alterações no arquivo JSON
    await fs.writeFile(caminhoJSON,JSON.stringify(jsonObj, null, 4), 'utf8');
    return true;

  } catch (err) {
    console.error('Erro ao modificar o JSON:', err);
    return false;
}
}

async function verificarOrdem() {
  try {
    // Ler o arquivo JSON
    const dados = await fs.readFile(caminhoJSON, 'utf8');
    let jsonObj = JSON.parse(dados);

    // Verifica se todas as posições do vetor "ordem" são iguais ao primeiro elemento
    return jsonObj['ordem'].every(valor => valor === jsonObj['ordem'][0]);

  } catch (err) {
    console.error('Erro ao modificar o JSON:', err);
    return false;
  }
}


async function modificarJSON(tipoDispositivo,id) {
  try {
      // Ler o arquivo JSON
      const dados = await fs.readFile(caminhoJSON, 'utf8');
      let jsonObj = JSON.parse(dados);
      // Modificar os valores dentro do JSON
      campo = tipoDispositivo=="fonte" ? "sincronizados_fonte": "sincronizados_sensor";
      jsonObj[campo][id-1]=true;
      // Salvar as alterações no arquivo JSON
      await fs.writeFile(caminhoJSON,JSON.stringify(jsonObj, null, 4), 'utf8');
      return true;
  } catch (err) {
      console.error('Erro ao modificar o JSON:', err);
      return false;
  }
}

async function verificarSincronizacao() {
   // Ler o arquivo JSON
   const dados = await fs.readFile(caminhoJSON, 'utf8');
   let jsonObj = JSON.parse(dados);
   vetor = jsonObj['sincronizados_sensor'];
   for(i=0;i<vetor.length;i++){
    if(!vetor[i]){
      return false
    }
   }
   return true;
}


async function calcularTempoChegada(id_sensor, ordem) {
  try {
      const db = await conectarBanco();
      
      const row1 = await db.get("SELECT tempo_de_chegada FROM Leitura WHERE ordem = ? AND id_sensor = ?", [ordem, id_sensor]);
      const row2 = await db.get("SELECT horario FROM Som WHERE ordem_emissao = ? AND id_fonte = 1", [ordem]);
      const row3 = await db.get("SELECT error_time FROM Fonte WHERE id_fonte = ?", [1]);
      const row4 = await db.get("SELECT error_time FROM Sensor WHERE id_sensor = ?", [id_sensor]);
      await db.close();
      console.log('id_sensor:',id_sensor,'- ordem',ordem);
      if (!row1 || !row2 ) {
          console.error("Dados ausentes no banco de dados.");
          return false;
      }

      // Converter os valores de TEXT para milissegundos
      const tempo_de_chegada = processarData(row1.tempo_de_chegada);
      const horario_emissao = processarData(row2.horario);
      const erro_time_fonte = row3.error_time;
      const erro_time_sensor = row4.error_time;

      // Calcular o tempo de chegada corrigido pelo erro
      return (tempo_de_chegada + erro_time_sensor) - (horario_emissao + erro_time_fonte);

  } catch (err) {
      console.error("Erro ao calcular tempo de chegada:", err.message);
      return false;
  }
}


function processarData(dataStr) {
  // Separar a parte dos microsegundos
  const [dataSemMicrossegundos, microssegundos] = dataStr.split(".");

  // Criar o objeto Date removendo os microssegundos
  const dateObj = new Date(dataSemMicrossegundos + "Z"); // Garantir que seja UTC

  // Pegar o timestamp em milissegundos
  const timestampMs = dateObj.getTime();

  // Converter microsegundos para número inteiro
  const micros = parseInt(microssegundos.slice(0, 6)) || 0; // Pega apenas os 6 primeiros dígitos

  // Combinar timestamp com microsegundos
  const timestampFinal = timestampMs * 1000 + micros; // Convertendo ms para µs e somando os microssegundos

  return timestampFinal;
}

function trilateracao(sensores, distancias) {
  const [s1, s2, s3] = sensores;
  const [d1, d2, d3] = distancias;

  // Coordenadas dos sensores
  const x1 = s1.coord_x, y1 = s1.coord_y;
  const x2 = s2.coord_x, y2 = s2.coord_y;
  const x3 = s3.coord_x, y3 = s3.coord_y;

  // Diferença entre sensores
  const A = 2 * (x2 - x1);
  const B = 2 * (y2 - y1);
  const C = 2 * (x3 - x1);
  const D = 2 * (y3 - y1);

  // Diferença das distâncias ao quadrado
  const E = d1 ** 2 - d2 ** 2 - x1 ** 2 - y1 ** 2 + x2 ** 2 + y2 ** 2;
  const F = d1 ** 2 - d3 ** 2 - x1 ** 2 - y1 ** 2 + x3 ** 2 + y3 ** 2;

  // Resolver sistema linear
  const x = (E * D - F * B) / (A * D - B * C);
  const y = (E * C - F * A) / (B * C - A * D);

  return { x, y };
}

async function getPosicaoSensor(id_sensor) {
  try {
    const db = await conectarBanco();
    const row = await db.get("SELECT coord_x, coord_y FROM Sensor WHERE id_sensor = ?", [id_sensor]);

    await db.close(); // Fecha o banco de dados após a consulta

    if (!row) {
        throw new Error("Nenhum sensor encontrado com esse ID.");
    }

    return row; // Retorna { coord_x: ..., coord_y: ... }
} catch (err) {
    console.error("Erro ao pegar a posição dos sensores:", err.message);
    return false;
}
}

async function getfonte() {
  try {
    const db = await conectarBanco();
    const row = await db.get("SELECT coord_x, coord_y FROM Fonte WHERE id_fonte = ?", [1]);

    await db.close(); // Fecha o banco de dados após a consulta

    if (!row) {
        throw new Error("Nenhum sensor encontrado com esse ID.");
    }

    return row; // Retorna { coord_x: ..., coord_y: ... }
} catch (err) {
    console.error("Erro ao pegar a posição dos sensores:", err.message);
    return false;
}
}

async function saveFonte(x,y,) {
  try {
    const db = await conectarBanco();
    // Atualizar os valores na tabela Fonte
    const resultado = await db.run(
        "UPDATE Fonte SET coord_x = ?, coord_y = ? WHERE id_fonte = ?",
        [x, y, 1]
    );

    await db.close();

    if (resultado.changes === 0) {
        throw new Error("Nenhuma linha foi alterada. Verifique se o ID existe.");
    }

    console.log("Registro atualizado com sucesso!");
} catch (err) {
    throw new Error("Erro ao atualizar a fonte: " + err.message);
}
}

async function calcularposicao(){
  console.log("calculando a posição");
  const ordemIgual = await verificarOrdem();
  const ordemAtual = await pegarOrdem(1);
  tempo_chegada=[0,0,0];
  if(ordemIgual & ordemAtual != 0){
      for(i=0;i<3;i++){
        tempo_chegada[i]= await calcularTempoChegada(i+1,ordemAtual);
        console.log("tempo_chegada,",tempo_chegada[i])
      }
      distancia = [0,0,0]
      for(i=0;i<tempo_chegada.length;i++){
        distancia[i] = velocidadeSom*tempo_chegada[i]*1e-6;
      }
      posicoes = []
      for(i=0;i<3;i++){
          posicoes[i]= await getPosicaoSensor(i+1);        
      }
      console.log(posicoes);
      const fonte = trilateracao(posicoes,distancia);
      await saveFonte(fonte['x'],fonte['y']);

  }
  
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
     id = await inserirSensor(body['coord_x'],body['coord_y'],diffUs);
    if(!id){
      return res.status(500).json({ error: "Erro Interno - Banco de Dados"});
    }
  }

  if(body["tipo"]== "fonte"){
     id = await inserirFonte(body['coord_x'],body['coord_y'],diffUs)
    if(!id){
      return res.status(500).json({ error: "Erro Interno - Banco de Dados"});
    }
  }
  retorno = await modificarJSON(body["tipo"],id)
  if(!retorno){
    return res.status(500).json({ error: "Erro Interno - Banco de Dados - JSON"});
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
  
  retorno = await inserirSom(body["hora_de_emissao"],body["id_fonte"])
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
      const retorno = await inserirLeitura(body["hora_de_chegada"], body["id_sensor"]);

      if (!retorno) {
        return res.status(500).json({ error: "Erro Interno - Banco de Dados - JSON" });
      }

      // Responder ao cliente antes de iniciar o processamento assíncrono
      res.status(200).json({ message: "Leitura recebida e processamento iniciado." });

      // Executar processamento assíncrono sem afetar a resposta HTTP
      setImmediate(() => {
        calcularposicao();
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
      fonte = await getfonte();
      return res.status(200).json(fonte)
  } catch (error) {
    console.error("Erro na rota /api/receber_leitura:", error);
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

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Ou acesse via rede local: http://${getLocalIP()}:${PORT}`);
});