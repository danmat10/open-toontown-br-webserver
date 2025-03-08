const BaseModel = require('./BaseModel');
const bcrypt = require('bcryptjs');
const { format } = require('date-fns');

class UserModel extends BaseModel {
    constructor(database) {
        super(database, 'users');
    }
    
    async create(userData) {
        const { email, username, password } = userData;
        
        // Verifica se usuário já existe
        const existingUser = await this.findOne({
            $or: [{ email }, { username }]
        });
        
        if (existingUser) {
            throw new Error(existingUser.email === email ? 
                'Email já está em uso' : 
                'Nome de usuário já está em uso'
            );
        }
        
        // Prepara os dados do usuário
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            email,
            username,
            password: hashedPassword,
            ESTATE_ID: 0,
            ACCOUNT_AV_SET_DEL: "[0, 0, 0, 0, 0, 0]",
            CREATED: format(new Date(), 'EEE MMM dd HH:mm:ss yyyy'),
            LAST_LOGIN: "",
            ACCESS_LEVEL: '"SYSTEM_ADMIN"'
        };
        
        return this.save(newUser);
    }
    
    async authenticate(credentials) {
        const { email, username, password } = credentials;
        
        const user = await this.findOne({
            $or: [{ email }, { username }]
        });
        
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('Senha incorreta');
        }
        
        // Atualiza último login
        user.LAST_LOGIN = format(new Date(), 'EEE MMM dd HH:mm:ss yyyy');
        await this.update({ id: user.id }, { LAST_LOGIN: user.LAST_LOGIN });
        
        return user;
    }
    
    async updateLastLogin(userId) {
        const lastLogin = format(new Date(), 'EEE MMM dd HH:mm:ss yyyy');
        return this.update({ id: userId }, { LAST_LOGIN: lastLogin });
    }
}

module.exports = UserModel;