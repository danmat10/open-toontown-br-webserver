require('dotenv').config();
const app = require('./app');
const dbManager = require('./database');

const PORT = process.env.PORT || 3000;

dbManager.connect()
.then(() => {
  console.log('YAML_DIR:', process.env.YAML_DIR);
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT} em modo ${process.env.NODE_ENV || 'production'}`));
})
.catch((err) => console.error('Erro ao inicializar o banco de dados:', err));