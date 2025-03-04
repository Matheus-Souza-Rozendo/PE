const conectarBanco = require('./bancodeDados'); 
const ArquivoJSON = require('./ArquivoJSON');
const sensor = require('./Sensor');

class Fonte{
    constructor(coordx,coordy,id,errorTime,caminhoJSON) {
      this.x = coordx;
      this.y = coordy;
      this.id = id;
      this.errorTime = errorTime;
      this.caminhoJSON = caminhoJSON;
    }
    
    async SalvarFonte(){
        try {
            const db = await conectarBanco();
            const sql = `INSERT INTO Fonte (coord_x, coord_y, error_time) VALUES (?, ?, ?)`;
            const result = await db.run(sql, [this.x, this.y, this.errorTime]);
            await db.close();
            this.id = result.lastID;
            
            var arquivoJSON =  new ArquivoJSON(this.caminhoJSON);
            await arquivoJSON.carregarArquivo()
            arquivoJSON.dados["sincronizados_fonte"][this.id-1]=true;
            const retorno = await arquivoJSON.salvarArquivo()
            if(!retorno){
                throw new Error('Erro ao salvar o Arquivo JSON');
            }

        } catch (err) {
            console.error('Erro ao inserir sensor:', err.message);
        }
    }
    async atualizar_error_time(){
        try {
            const db = await conectarBanco();
            const row = await db.get("SELECT error_time FROM Fonte WHERE id_fonte = ?", [this.id]);
            this.errorTime = row.error_time;
            return true;
        } catch (err) {
            console.error('Erro ao inserir sensor:', err.message);
            return false;
        }
        
    }

    async verificarOrdem(){
        try {
            // Ler o arquivo JSON
            const arquivo = new ArquivoJSON(this.caminhoJSON)
            await arquivo.carregarArquivo()
            const jsonObj = arquivo.dados;
            // Verifica se todas as posições do vetor "ordem" são iguais ao primeiro elemento
            return jsonObj['ordem'].every(valor => valor === jsonObj['ordem'][0]);
        
          } catch (err) {
            console.error('Erro ao modificar o JSON:', err);
            return false;
          }
    }

    trilateracao(sensores, distancias) {
        const [s1, s2, s3] = sensores;
        const [d1, d2, d3] = distancias;
      
        // Coordenadas dos sensores
        const x1 = s1.x, y1 = s1.y;
        const x2 = s2.x, y2 = s2.y;
        const x3 = s3.x, y3 = s3.y;
      
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
        
        console.log(x,y)
        this.x = x;
        this.y = y;
    }

    async calcularposicao(){
        console.log("calculando a posição");
        const som = require('./Som'); 
        const ordemIgual = await this.verificarOrdem()
        let sensores = [null,null,null];
        for(let i=0;i<3;i++){
            sensores[i] = new sensor(null,null,i+1,null,this.caminhoJSON);
        } 
        const ordemAtual = await sensores[0].getOrdem()
        let tempo_chegada=[0,0,0];
        console.log(ordemAtual,ordemIgual)
        if(ordemIgual & ordemAtual != 0){
            const Som = new som(1,null,this.caminhoJSON,ordemAtual);
            await Som.atualizar_horario_emisao()
            for(i=0;i<3;i++){
                tempo_chegada[i]= await Som.calculartempochegada(sensores[i])
                console.log("tempo_chegada,",tempo_chegada[i])
            }
            let distancia = [0,0,0]
            for(i=0;i<tempo_chegada.length;i++){
                distancia[i] = 343*tempo_chegada[i]*1e-6;
            }
            for(i=0;i<3;i++){
                await sensores[i].atualizarPosicao()      
            }
            this.trilateracao(sensores,distancia)
            await this.updateFonte();
        }
    }

    async updateFonte(){
        try {
            const db = await conectarBanco();
            // Atualizar os valores na tabela Fonte
            const resultado = await db.run(
                "UPDATE Fonte SET coord_x = ?, coord_y = ? WHERE id_fonte = ?",
                [this.x, this.y, this.id]
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

    async carregaPosicao(){
        try {
            const db = await conectarBanco();
            const row = await db.get("SELECT coord_x, coord_y FROM Fonte WHERE id_fonte = ?", [this.id]);
            
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

    getPosicao(){
        return {"x":this.x,"y":this.y}
    }


  }
  
  module.exports = Fonte;