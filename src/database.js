const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs');
const mongoose = require('mongoose');

class DatabaseManager {
    constructor(isDev = process.env.NODE_ENV === 'development') {
        console.log(process.env.NODE_ENV);
        this.isDev = isDev;
        this.yamlDir = process.env.YAML_DIR || path.join(__dirname, '../data');
        this.usersFile = path.join(this.yamlDir, 'users.json');
        
        console.log('DatabaseManager initialized with:', {
            isDev: this.isDev,
            yamlDir: this.yamlDir
        });
    }

    async connect() {
        if (this.isDev) {
            // Verifica se o diretório existe, se não, cria
            if (!fs.existsSync(this.yamlDir)) {
                fs.mkdirSync(this.yamlDir, { recursive: true });
            }
            // Inicializa o arquivo de usuários se não existir
            if (!fs.existsSync(this.usersFile)) {
                fs.writeFileSync(this.usersFile, JSON.stringify([], null, 2));
            }
            console.log('Modo DEV: Usando banco de dados local');
            return Promise.resolve();
        }
        
        // Conexão normal com MongoDB
        return mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    }

    async findOne(collection, query) {
        if (this.isDev) {
            try {
                // Lê todos os arquivos do diretório
                const files = fs.readdirSync(this.yamlDir);
                
                // Filtra apenas arquivos .yaml
                const yamlFiles = files.filter(file => file.endsWith('.yaml'));
                
                // Procura em cada arquivo
                for (const file of yamlFiles) {
                    const filePath = path.join(this.yamlDir, file);
                    const fileContents = fs.readFileSync(filePath, 'utf8');
                    const data = yaml.load(fileContents);
                    
                    // Verifica se o objeto corresponde à query
                    const matches = Object.entries(query).every(([key, value]) => {
                        const actualValue = this._getNestedValue(data, key);
                        return actualValue === value;
                    });
                    
                    if (matches) {
                        return data;
                    }
                }
                return null;
            } catch (error) {
                console.error('Erro ao ler arquivos YAML:', error);
                return null;
            }
        }
        // Retorna null para indicar que deve usar o mongoose normalmente
        return null;
    }

    _getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => 
            current ? current[key] : undefined, obj);
    }

    // Métodos específicos para usuários em modo DEV
    async saveUser(userData) {
        if (!this.isDev) return null;

        try {
            const users = JSON.parse(fs.readFileSync(this.usersFile, 'utf8'));
            const lastUser = users.length > 0 ? users[users.length - 1] : { id: 100000000 - 1 };
            userData.id = lastUser.id + 1;
            userData._id = userData.id;
            users.push(userData);
            fs.writeFileSync(this.usersFile, JSON.stringify(users, null, 2));
            return userData;
        } catch (error) {
            console.error('Erro ao salvar usuário:', error);
            throw error;
        }
    }

    async findUserBy(query) {
        if (!this.isDev) return null;

        try {
            const users = JSON.parse(fs.readFileSync(this.usersFile, 'utf8'));
            return users.find(user => {
                return Object.entries(query).every(([key, value]) => {
                    if (key === '$or') {
                        return value.some(condition => {
                            return Object.entries(condition).every(([k, v]) => user[k] === v);
                        });
                    }
                    return user[key] === value;
                });
            });
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            return null;
        }
    }

    async findUserById(id) {
        return this.findUserBy({ id });
    }
}

module.exports = new DatabaseManager();