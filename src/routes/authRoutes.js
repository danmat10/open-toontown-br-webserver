const express = require('express');
const authController = require('../controllers/authController');
const astronController = require('../controllers/astronController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Rotas públicas
router.post('/validate-token', authController.validateToken);

// Rotas privadas
router.post('/signup', authController.signup);
router.post('/login', authController.login);

module.exports = router;