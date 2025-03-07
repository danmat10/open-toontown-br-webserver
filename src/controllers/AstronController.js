const BaseController = require('./BaseController');
const jwt = require('jsonwebtoken');

class AstronController extends BaseController {
    constructor(models) {
        super(models);
    }

    getAstronAccount = this.asyncHandler(async (req, res) => {
        const { token } = req.query;

        if (!token) {
            throw new Error('Token não fornecido');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userModel = this.models.getModel('user');
        const astronModel = this.models.getModel('astron');
        const user = await userModel.findOne({ id: decoded.id });
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        const astronAccount = await astronModel.findByAccountId(user.username);
        if (!astronAccount) {
            throw new Error('AstronAccount não encontrado');
        }
        const id = astronAccount._id || astronAccount.id;
        this.sendResponse(res, { _id: id });
    });
}

module.exports = AstronController;