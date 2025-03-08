class BaseController {
    constructor(models) {
        this.models = models;
    }
    
    // Método utilitário para enviar respostas
    sendResponse(res, data, status = 200) {
        res.status(status).json(data);
    }
    
    // Método utilitário para enviar erros
    sendError(res, error, status = 400) {
        const message = error instanceof Error ? error.message : error;
        res.status(status).json({ error: message });
    }
    
    // Método para envolver os handlers com try/catch
    asyncHandler(handler) {
        return async (req, res) => {
            try {
                await handler(req, res);
            } catch (error) {
                this.sendError(res, error);
            }
        };
    }
}

module.exports = BaseController;