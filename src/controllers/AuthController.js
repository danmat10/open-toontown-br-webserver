const BaseController = require("./BaseController");
const jwt = require("jsonwebtoken");

class AuthController extends BaseController {
  constructor(models) {
    super(models);
  }

  generateToken(userId) {
    return jwt.sign(
      {
        id: userId.toString(),
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      },
      process.env.JWT_SECRET
    );
  }

  signup = this.asyncHandler(async (req, res) => {
    const userModel = this.models.getModel("user");
    // Cria o usuário
    const user = await userModel.create(req.body);

    // Gera o token e envia resposta
    const token = this.generateToken(user.id);
    this.sendResponse(
      res,
      {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
      201
    );
  });

  login = this.asyncHandler(async (req, res) => {
    const userModel = this.models.getModel("user");

    // Autentica o usuário
    const user = await userModel.authenticate(req.body);

    // Gera o token
    const token = this.generateToken(user.id);

    this.sendResponse(res, {
      token,
      id: user.id,
      username: user.username,
      email: user.email,
      ACCOUNT_AV_SET: user.ACCOUNT_AV_SET,
      ESTATE_ID: user.ESTATE_ID,
      ACCESS_LEVEL: user.ACCESS_LEVEL,
    });
  });

  validateToken = this.asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
      throw new Error("Token não fornecido");
    }
    const userModel = this.models.getModel("user");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findOne({ id: decoded.id });
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    this.sendResponse(res, {
      success: true,
      username: user.username,
      ACCOUNT_AV_SET: user.ACCOUNT_AV_SET,
      ESTATE_ID: user.ESTATE_ID,
      ACCOUNT_AV_SET_DEL: user.ACCOUNT_AV_SET_DEL,
      CREATED: user.CREATED,
      LAST_LOGIN: user.LAST_LOGIN,
      ACCOUNT_ID: user.id,
      ACCESS_LEVEL: user.ACCESS_LEVEL,
    });
  });
}

module.exports = AuthController;
