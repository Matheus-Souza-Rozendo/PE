const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

// Função assíncrona para conectar ao banco de dados
async function conectarBanco() {
  return await open({
    filename: 'dados.db',
    driver: sqlite3.Database,
  });
}

// Exportar a função
module.exports = conectarBanco;