const express = require('express');
const app = express();
const PORT = 3000;

// Servir arquivos estáticos
app.use(express.static('public'));

// Iniciar servidor e ouvir em todas as interfaces de rede
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Ou acesse via rede local: http://192.168.1.4:${PORT}`);
});