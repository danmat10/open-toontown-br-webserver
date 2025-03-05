const express = require('express');
const astronController = require('../controllers/astronController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Rotas públicas
router.get('/account', astronController.getAstronAccount);

module.exports = router;