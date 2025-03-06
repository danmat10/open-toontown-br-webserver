const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const dbManager = require('../database');


// Modelo para a coleção astron.objects
const astronObjectSchema = new mongoose.Schema({
    _id: Number,
    dclass: String,
    fields: mongoose.Schema.Types.Mixed, // Campo dinâmico para fields
});

const AstronObject = mongoose.model('AstronObject', astronObjectSchema, 'astron.objects'); // Nome da coleção: astron.objects

// Função para buscar o AstronAccount
exports.getAstronAccount = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ error: 'Token não fornecido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        // Tenta buscar primeiro no banco de dados de desenvolvimento
        let astronAccount = await dbManager.findOne('astron.objects', {
            dclass: 'AstronAccount',
            'fields.ACCOUNT_ID': user.username,
        });

        // Se não encontrou no modo DEV, usa o MongoDB
        if (!astronAccount && !dbManager.isDev) {
            astronAccount = await AstronObject.findOne({
                dclass: 'AstronAccount',
                'fields.ACCOUNT_ID': user.username,
            });
        }

        if (!astronAccount) {
            return res.status(404).json({ error: 'AstronAccount não encontrado' });
        }

        res.json({ _id: astronAccount._id });
    } catch (err) {
        res.status(401).json({ error: 'Token inválido ou erro na busca' });
    }
};