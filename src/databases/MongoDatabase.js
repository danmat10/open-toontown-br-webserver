const mongoose = require('mongoose');

class MongoDatabase extends require('./IDatabase') {
    constructor() {
        super();
        this.connection = null;
    }
    
    async connect(uri) {
        try {
            this.connection = await mongoose.connect(uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('Conectado ao MongoDB com sucesso');
        } catch (error) {
            console.error('Erro ao conectar ao MongoDB:', error);
            throw error;
        }
    }
    
    async findOne(collection, query) {
        const model = this._getModel(collection);
        return model.findOne(query);
    }
    
    async findById(collection, id) {
        const model = this._getModel(collection);
        return model.findById(id);
    }
    
    async save(collection, data) {
        const model = this._getModel(collection);
        const document = new model(data);
        return document.save();
    }
    
    async update(collection, query, updateData) {
        const model = this._getModel(collection);
        return model.findOneAndUpdate(query, updateData, { new: true });
    }
    
    async delete(collection, query) {
        const model = this._getModel(collection);
        const result = await model.deleteOne(query);
        return result.deletedCount > 0;
    }
    
    _getModel(collection) {
        if (!mongoose.models[collection]) {
            // Schema dinâmico para desenvolvimento
            const schema = new mongoose.Schema({}, { strict: false });
            return mongoose.model(collection, schema);
        }
        return mongoose.models[collection];
    }
}

module.exports = MongoDatabase;