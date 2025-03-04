const conectarBanco = require('./bancodeDados'); 
const ArquivoJSON = require('./ArquivoJSON');

class Sensor{
    constructor(coordx,coordy,id,errorTime,caminhoJSON) {
      this.x = coordx;
      this.y = coordy;
      this.id = id;
      this.errorTime = errorTime;
      this.caminhoJSON = caminhoJSON
    }
    
    async SalvarSensor(){
        try {
            const db = await conectarBanco();
            const sql = `INSERT INTO Sensor (coord_x, coord_y, error_time) VALUES (?, ?, ?)`;
            
            const result = await db.run(sql, [this.x, this.y, this.errorTime]);
            await db.close();
            this.id = result.lastID;
            
            var arquivoJSON =  new ArquivoJSON(this.caminhoJSON);
            await arquivoJSON.carregarArquivo()
            arquivoJSON.dados["sincronizados_sensor"][this.id-1]=true;
            const retorno = await arquivoJSON.salvarArquivo()
            if(!retorno){
                throw new Error('Erro ao salvar o Arquivo JSON');
            }

        } catch (err) {
            console.error('Erro ao inserir sensor:', err.message);
        }
    }
     async getOrdem(){
        try {
            var arquivo = new ArquivoJSON(this.caminhoJSON)
            await arquivo.carregarArquivo()
            return arquivo.dados['ordem'][this.id];
          } catch (err) {
            console.error('Erro ao modificar o JSON:', err);
            return false;
        }
     }

     async atualizar_error_time(){
        try {
            const db = await conectarBanco();
            const row = db.get("SELECT error_time FROM Sensor WHERE id_sensor = ?", [this.id]);
            this.errorTime = row.error_time;
            return true;
        } catch (err) {
            console.error('Erro ao inserir sensor:', err.message);
            return false;
        }
    }

    async atualizarPosicao(){
        try {
            const db = await conectarBanco();
            const row = await db.get("SELECT coord_x, coord_y FROM Sensor WHERE id_sensor = ?", [this.id]);
            await db.close(); // Fecha o banco de dados após a consulta
        
            if (!row) {
                throw new Error("Nenhum sensor encontrado com esse ID.");
            }
        
            this.x = row.coord_x;
            this.y = row.coord_y; 
            return true;
        } catch (err) {
            console.error("Erro ao pegar a posição dos sensores:", err.message);
            return false;
        }
    }
  }
  
  module.exports = Sensor;