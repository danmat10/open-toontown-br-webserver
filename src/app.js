const express = require('express');
const authRoutes = require('./routes/authRoutes');
const astronRoutes = require('./routes/astronRoutes');

class App {
    constructor() {
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
    }
    
    setupMiddleware() {
        this.app.use(express.json());
        
        // Middleware para logging
        if (process.env.NODE_ENV === 'development') {
            this.app.use((req, res, next) => {
                console.log(`${req.method} ${req.path}`);
                next();
            });
        }
        
        // Middleware para CORS
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            if (req.method === 'OPTIONS') {
                res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
                return res.status(200).json({});
            }
            next();
        });
    }
    
    setupRoutes() {
        this.app.use('/api/auth', authRoutes);
        this.app.use('/api/astron', astronRoutes);
        
        // Middleware de erro 404
        this.app.use((req, res) => {
            res.status(404).json({ error: 'Rota não encontrada' });
        });
        
        // Middleware de tratamento de erros
        this.app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).json({ 
                error: process.env.NODE_ENV === 'development' 
                ? err.message 
                : 'Erro interno do servidor'
            });
        });
    }
    
    getApp() {
        return this.app;
    }
}

// Exporta uma instância do app
module.exports = new App().getApp();