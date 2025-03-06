const express = require('express');
const controllers = require('../controllers');
const router = express.Router();

const astronController = controllers.getController('astron');

// Rotas públicas
router.get('/account', astronController.getAstronAccount);

module.exports = router;