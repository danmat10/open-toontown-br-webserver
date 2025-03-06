const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { format } = require('date-fns');
const dbManager = require('../database');

class UserModel {
    constructor(data) {
        this.data = data;
    }

    async save() {
        if (dbManager.isDev) {
            // Criptografa a senha
            if (this.data.password) {
                this.data.password = await bcrypt.hash(this.data.password, 10);
            }
            
            // Define campos padrão
            this.data.ESTATE_ID = this.data.ESTATE_ID || 0;
            this.data.ACCOUNT_AV_SET_DEL = this.data.ACCOUNT_AV_SET_DEL || "[0, 0, 0, 0, 0, 0]";
            this.data.CREATED = format(new Date(), 'EEE MMM dd HH:mm:ss yyyy');
            this.data.ACCESS_LEVEL = this.data.ACCESS_LEVEL || '"SYSTEM_ADMIN"';
            
            return dbManager.saveUser(this.data);
        }
        
        // Se não estiver em modo DEV, usa o Mongoose
        return mongoose.model('User', userSchema).create(this.data);
    }

    static async findOne(query) {
        if (dbManager.isDev) {
            return dbManager.findUserBy(query);
        }
        return mongoose.model('User', userSchema).findOne(query);
    }

    static async findById(id) {
        if (dbManager.isDev) {
            return dbManager.findUserById(id);
        }
        return mongoose.model('User', userSchema).findById(id);
    }
}

const userSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  ESTATE_ID: { type: Number, default: 0 },
  ACCOUNT_AV_SET_DEL: { type: String, default: "[0, 0, 0, 0, 0, 0]" },
  CREATED: { type: String, default: "" },
  LAST_LOGIN: { type: String, default: "" },
  ACCESS_LEVEL: { type: String, default: '"SYSTEM_ADMIN"' },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

userSchema.pre('save', async function (next) {
  if (this.isNew) {
    const lastUser = await this.constructor.findOne({}, {}, { sort: { id: -1 } }); 
    this.id = lastUser ? lastUser.id + 1 : 100000000;
  }
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  this.CREATED = format(new Date(), 'EEE MMM dd HH:mm:ss yyyy');
  next();
});

// Exporta o modelo apropriado baseado no modo
module.exports = dbManager.isDev ? UserModel : mongoose.model('User', userSchema);