const fs = require('fs').promises; 


class ArquivoJSON{
    constructor(caminho) {
      this.caminho = caminho;
      this.dados = null;
    }
    
    async carregarArquivo(){
         // Ler o arquivo JSON
      const dados = await fs.readFile(this.caminho, 'utf8');
      this.dados = JSON.parse(dados);
    }

    async salvarArquivo(){
    // Salvar as alterações no arquivo JSON
      await fs.writeFile(this.caminho,JSON.stringify(this.dados, null, 4), 'utf8');
      return true;
    }
  }
  
  module.exports = ArquivoJSON;