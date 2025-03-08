const modelManager = require('../models');
const AuthController = require('./AuthController');
const AstronController = require('./AstronController');

class ControllerManager {
    constructor() {
        this.controllers = {
            auth : new AuthController(modelManager),
            astron : new AstronController(modelManager)
        };
        
    }
    
    initialize() {
        console.log('Controllers inicializados');
    }
    
    getController(name) {
        if (!this.controllers[name]) {
            throw new Error(`Controller '${name}' não encontrado`);
        }
        return this.controllers[name];
    }
}

const controllerManager = new ControllerManager();
module.exports = controllerManager;