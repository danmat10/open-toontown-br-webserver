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
}

module.exports = AstronModel;