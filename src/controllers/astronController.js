const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');


// Modelo para a coleção astron.objects
const astronObjectSchema = new mongoose.Schema({
    _id: Number,
    dclass: String,
    fields: mongoose.Schema.Types.Mixed, // Campo dinâmico para fields
});

const AstronObject = mongoose.model('AstronObject', astronObjectSchema, 'astron.objects'); // Nome da coleção: astron.objects

// Função para buscar o AstronAccount
exports.getAstronAccount = async (req, res) => {
    const { token } = req.query; // Recebe o token como parâmetro

    if (!token) {
        return res.status(400).json({ error: 'Token não fornecido' });
    }

    try {
        // Verifica e decodifica o token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Extrai o e-mail do payload do token
        const user = await User.findById(decoded.id);

        // Busca o documento na coleção astron.objects
        const astronAccount = await AstronObject.findOne({
            dclass: 'AstronAccount',
            'fields.ACCOUNT_ID': user.username,
        });

        if (!astronAccount) {
            return res.status(404).json({ error: 'AstronAccount não encontrado' });
        }

        // Retorna o _id do documento encontrado
        res.json({ _id: astronAccount._id });
    } catch (err) {
        res.status(401).json({ error: 'Token inválido ou erro na busca' });
    }
};