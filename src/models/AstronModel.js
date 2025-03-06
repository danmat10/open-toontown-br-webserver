const BaseModel = require('./BaseModel');

class AstronModel extends BaseModel {
    constructor(database) {
        super(database, 'astron.objects');
    }
    
    async findByAccountId(accountId) {
        return this.findOne({
            dclass: 'AstronAccount',
            'fields.ACCOUNT_ID': accountId
        });
    }
    
    async create(accountData) {
        const newAstronAccount = {
            dclass: 'AstronAccount',
            fields: {
                ACCOUNT_ID: accountData.username,
                ESTATE_ID: 0,
                ACCOUNT_AV_SET: [],
                ACCOUNT_AV_SET_DEL: [0, 0, 0, 0, 0, 0],
                CREATED: accountData.CREATED,
                LAST_LOGIN: "",
                ACCESS_LEVEL: accountData.ACCESS_LEVEL || "SYSTEM_ADMIN"
            }
        };
        
        return this.save(newAstronAccount);
    }
}

module.exports = AstronModel;