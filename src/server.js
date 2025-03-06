require('dotenv').config();
const app = require('./app');
const modelManager = require('./models');
const controllerManager = require('./controllers');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Inicializa os models primeiro
    await modelManager.initialize({
      userDbPath: process.env.USER_DB_PATH,
      yamlDir: process.env.YAML_DIR
    });
    
    // Inicializa os controllers
    controllerManager.initialize();
    
    // Inicia o servidor
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT} em modo ${process.env.NODE_ENV || 'production'}`);
      console.log('YAML_DIR:', process.env.YAML_DIR);
    });
  } catch (error) {
    console.error('Erro ao inicializar o servidor:', error);
    process.exit(1);
  }
}

startServer();