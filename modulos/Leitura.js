const conectarBanco = require('./bancodeDados'); 
const ArquivoJSON = require('./ArquivoJSON');

class Leitura{
    constructor(id_sensor,horario_chegada, caminhoJson,ordem){
        this.id_sensor= id_sensor;
        this.horario_chegada = horario_chegada;
        this.caminhoJson = caminhoJson;
        this.ordem = ordem;
    }

    async salvarLeitura(){
        try {
            const db = await conectarBanco();

            var arquivo = new ArquivoJSON(this.caminhoJson)
            await arquivo.carregarArquivo()
            const ordem = arquivo.dados['ordem'][this.id_sensor-1];

            const sql = `INSERT INTO Leitura (tempo_de_chegada,id_sensor,id_fonte,ordem) VALUES ( ?, ?, 1, ?)`;
            
            await db.run(sql, [this.horario_chegada,this.id_sensor,ordem+1]);
            await db.close();
            
            arquivo.dados['ordem'][this.id_sensor-1]++;
            return await arquivo.salvarArquivo()
            
            
        } catch (err) {
            console.error('Erro ao inserir sensor:', err.message);
            return false;
        }
    }

    async atualizar_horario_chegada(){
        try {
            const db = await conectarBanco();
            const row = await db.get("SELECT tempo_de_chegada FROM Leitura WHERE ordem = ? AND id_sensor = ?", [this.ordem, this.id_sensor]);
            this.horario_chegada = row.tempo_de_chegada;
            return true;
        } catch (err) {
            console.error('Erro ao inserir sensor:', err.message);
            return false;
        }
        
    }
}

module.exports = Leitura;