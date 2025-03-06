/**
* Interface que define os métodos que qualquer implementação de banco de dados deve ter
*/
class IDatabase {
    async findOne(collection, query) {
        throw new Error('Method not implemented');
    }
    
    async findById(collection, id) {
        throw new Error('Method not implemented');
    }
    
    async save(collection, data) {
        throw new Error('Method not implemented');
    }
    
    async update(collection, query, data) {
        throw new Error('Method not implemented');
    }
    
    async delete(collection, query) {
        throw new Error('Method not implemented');
    }
}

module.exports = IDatabase;