const DatabaseFactory = require('../databases/DatabaseFactory');
const UserModel = require('./UserModel');
const AstronModel = require('./AstronModel');

class ModelManager {
    constructor() {
        this.databases = {};
        this.models = {};
    }
    
    async initialize(config) {
        const isDev = process.env.NODE_ENV === 'development';
        
        // Configura banco de dados para usuários
        const userDb = await DatabaseFactory.create(
            isDev ? 'json' : 'mongodb',
            {
                uri: process.env.MONGODB_URI,
                baseDir: config.userDbPath
            }
        );
        
        // Configura banco de dados para Astron
        const astronDb = await DatabaseFactory.create(
            isDev ? 'yaml' : 'mongodb',
            {
                uri: process.env.MONGODB_URI,
                baseDir: config.yamlDir
            }
        );
        
        // Inicializa os models
        this.models.user = new UserModel(userDb);
        this.models.astron = new AstronModel(astronDb);
        
        console.log(`Models inicializados em modo ${isDev ? 'desenvolvimento' : 'produção'}`);
    }
    
    getModel(name) {
        if (!this.models[name]) {
            throw new Error(`Model '${name}' não encontrado`);
        }
        return this.models[name];
    }
}

module.exports = new ModelManager();