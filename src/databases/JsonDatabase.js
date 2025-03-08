const fs = require('fs');
const path = require('path');

class JsonDatabase extends require('./IDatabase') {
    constructor(baseDir) {
        super();
        this.baseDir = baseDir;
        this.ensureDirectory();
    }
    
    ensureDirectory() {
        if (!fs.existsSync(this.baseDir)) {
            fs.mkdirSync(this.baseDir, { recursive: true });
        }
    }
    
    getCollectionPath(collection) {
        return path.join(this.baseDir, `${collection}.json`);
    }
    
    async findOne(collection, query) {
        try {
            const data = this._readCollection(collection);
            return data.find(item => this._matchesQuery(item, query));
        } catch (error) {
            console.error('Erro ao buscar no JSON:', error);
            return null;
        }
    }
    
    async findById(collection, id) {
        try {
            const data = this._readCollection(collection);
            return data.find(item => item.id == id);
        } catch (error) {
            console.error('Erro ao buscar por ID no JSON:', error);
            return null;
        }
    }
    
    async save(collection, data) {
        try {
            const items = this._readCollection(collection);
            const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
            const newItem = { ...data, id: newId };
            items.push(newItem);
            this._writeCollection(collection, items);
            return newItem;
        } catch (error) {
            console.error('Erro ao salvar no JSON:', error);
            throw error;
        }
    }
    
    async update(collection, query, updateData) {
        try {
            const items = this._readCollection(collection);
            const index = items.findIndex(item => this._matchesQuery(item, query));
            
            if (index === -1) {
                return null;
            }
            
            const updatedItem = this._updateObject(items[index], updateData);
            items[index] = updatedItem;
            
            this._writeCollection(collection, items);
            return updatedItem;
        } catch (error) {
            console.error('Erro ao atualizar no JSON:', error);
            throw error;
        }
    }
    
    async delete(collection, query) {
        try {
            const items = this._readCollection(collection);
            const initialLength = items.length;
            const filteredItems = items.filter(item => !this._matchesQuery(item, query));
            
            if (filteredItems.length === initialLength) {
                return false;
            }
            
            this._writeCollection(collection, filteredItems);
            return true;
        } catch (error) {
            console.error('Erro ao deletar no JSON:', error);
            throw error;
        }
    }
    
    _readCollection(collection) {
        const filePath = this.getCollectionPath(collection);
        if (!fs.existsSync(filePath)) {
            return [];
        }
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    
    _writeCollection(collection, data) {
        const filePath = this.getCollectionPath(collection);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }
    
    _matchesQuery(data, query) {
        return Object.entries(query).every(([key, value]) => {
            if (key === '$or') {
                return value.some(condition => this._matchesQuery(data, condition));
            }
            const actualValue = this._getNestedValue(data, key);
            return this._compareValues(actualValue, value);
        });
    }
    
    _compareValues(actual, expected) {
        if (typeof expected === 'object' && expected !== null) {
            return Object.entries(expected).every(([op, value]) => {
                switch (op) {
                    case '$eq': return actual === value;
                    case '$ne': return actual !== value;
                    case '$gt': return actual > value;
                    case '$gte': return actual >= value;
                    case '$lt': return actual < value;
                    case '$lte': return actual <= value;
                    case '$in': return Array.isArray(value) && value.includes(actual);
                    case '$nin': return Array.isArray(value) && !value.includes(actual);
                    default: return actual === expected;
                }
            });
        }
        return actual == expected;
    }
    
    _getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => 
            current ? current[key] : undefined, obj);
    }
    
    _updateObject(obj, updates) {
        const updated = { ...obj };
        
        Object.entries(updates).forEach(([key, value]) => {
            if (key.includes('.')) {
                const parts = key.split('.');
                let current = updated;
                for (let i = 0; i < parts.length - 1; i++) {
                    if (!current[parts[i]]) {
                        current[parts[i]] = {};
                    }
                    current = current[parts[i]];
                }
                current[parts[parts.length - 1]] = value;
            } else {
                updated[key] = value;
            }
        });
        
        return updated;
    }
}

module.exports = JsonDatabase;