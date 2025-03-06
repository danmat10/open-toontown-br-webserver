const express = require('express');
const controllers = require('../controllers');
const router = express.Router();

const authController = controllers.getController('auth');

// Rotas públicas
router.post('/validate-token', authController.validateToken);

// Rotas privadas
router.post('/signup', authController.signup);
router.post('/login', authController.login);

module.exports = router;