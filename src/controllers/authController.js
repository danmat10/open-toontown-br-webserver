const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// Função para gerar token JWT
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Signup
exports.signup = async (req, res) => {
    const { email, username, password } = req.body;
    try {
        const user = new User({ email, username, password });
        await user.save();
        res.status(201).json({ message: 'Usuário criado com sucesso!' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
};

// Login
exports.login = async (req, res) => {
    const { email, username, password } = req.body;
    try {
        const user = await
            User.findOne({ $or: [{ email }, { username }] });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        const token = generateToken(user._id);
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
};

// Verify Token
exports.validateToken = async (req, res) => {
    const { token } = req.body; // Recebe o token no corpo da requisição

    if (!token) {
        return res.status(400).json({ error: 'Token não fornecido' });
    }

    try {
        // Verifica e decodifica o token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Busca o usuário no banco de dados
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Retorna o id e o email (ou username) do usuário
        res.json({
            success: true,
            username: user.username,
            ACCOUNT_AV_SET: user.ACCOUNT_AV_SET,
            ESTATE_ID: user.ESTATE_ID,
            ACCOUNT_AV_SET_DEL: user.ACCOUNT_AV_SET_DEL,
            CREATED: user.CREATED,
            LAST_LOGIN: user.LAST_LOGIN,
            ACCOUNT_ID: user.id,
            ACCESS_LEVEL: user.ACCESS_LEVEL
        });
    } catch (err) {
        // Se o token for inválido ou expirado
        res.json({
            isValid: false,
            error: 'Token inválido ou expirado',
        });
    }
};
