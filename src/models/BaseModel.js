class BaseModel {
    constructor(database, collection) {
        this.db = database;
        this.collection = collection;
    }
    
    async findOne(query, projection = {}, options = {}) {
        return this.db.findOne(this.collection, query, projection, options);
    }
    
    async findById(id) {
        return this.db.findById(this.collection, id);
    }
    
    async save(data) {
        return this.db.save(this.collection, data);
    }
    
    async update(query, data) {
        return this.db.update(this.collection, query, data);
    }
    
    async delete(query) {
        return this.db.delete(this.collection, query);
    }
}

module.exports = BaseModel;