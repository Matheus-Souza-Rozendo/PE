const conectarBanco = require('./bancodeDados'); 
const Fonte = require("./Fonte");
const leitura = require('./Leitura');
const HRT = require('./HighResolutionTime')
console.log("Conteudo de fonte",Fonte)

class Som{
    constructor(id_fonte,horario,caminhoJSON,ordem){
        this.id_fonte=id_fonte;
        this.horario = horario;
        this.ordem_emissao = ordem;
        this.caminhoJSON = caminhoJSON;
    }

    async salvarSom(){
        try {
            const db = await conectarBanco();
            const sql = `INSERT INTO Som (horario, id_fonte) VALUES ( ?, ?)`;
            
            await db.run(sql, [this.horario,this.id_fonte]);
            await db.close();
            return true;
            
        } catch (err) {
            console.error('Erro ao inserir sensor:', err.message);
            return false;
        }
    }

    async calculartempochegada(Sensor){
        try {
            const Leitura = new leitura(Sensor.id,null,this.caminhoJSON,this.ordem_emissao);
            const retorno1 = await Leitura.atualizar_horario_chegada()
            const fonte = new Fonte(null,null,1,null,this.caminhoJSON);
            const retorno2 = await fonte.atualizar_error_time()
            const retorno3 = Sensor.atualizar_error_time()
           
            if (!retorno1 || !retorno2 ||  !retorno3) {
                console.error("Dados ausentes no banco de dados.");
                return false;
            }
            const hrt = new HRT();
            // Converter os valores de TEXT para milissegundos
            const tempo_de_chegada = hrt.isoToMicroseconds(Leitura.horario_chegada)
            const horario_emissao = hrt.isoToMicroseconds(this.horario);
            const erro_time_fonte = fonte.errorTime;
            const erro_time_sensor = Sensor.errorTime;
            console.log("tempo de chegada:",tempo_de_chegada);
            console.log("tempo emissão:",horario_emissao)
            // Calcular o tempo de chegada corrigido pelo erro
            return (tempo_de_chegada + erro_time_sensor) - (horario_emissao + erro_time_fonte);
            
            
        } catch (err) {
            console.error("Erro ao calcular tempo de chegada:", err.message);
            return false;
        }
    }

    async atualizar_horario_emisao(){
        try {
            const db = await conectarBanco();
            const row = await db.get("SELECT horario FROM Som WHERE ordem_emissao = ? AND id_fonte = 1", [this.ordem_emissao]);
            this.horario = row.horario;
            return true;
        } catch (err) {
            console.error('Erro ao inserir sensor:', err.message);
            return false;
        }
        
    }
}

module.exports = Som;