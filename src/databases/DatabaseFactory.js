const MongoDatabase = require('../databases/MongoDatabase');
const YamlDatabase = require('../databases/YamlDatabase');
const JsonDatabase = require('../databases/JsonDatabase');

class DatabaseFactory {
    static async create(type, config) {
        switch (type) {
            case 'mongodb': {
                const db = new MongoDatabase();
                await db.connect(config.uri);
                return db;
            }
            case 'yaml':
            return new YamlDatabase(config.baseDir);
            case 'json':
            return new JsonDatabase(config.baseDir);
            default:
            throw new Error(`Database type '${type}' not supported`);
        }
    }
}

module.exports = DatabaseFactory;