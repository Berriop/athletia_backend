"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MealController = void 0;
class MealController {
    constructor(createUseCase, getAllUseCase, getByIdUseCase, updateUseCase, deleteUseCase) {
        this.createUseCase = createUseCase;
        this.getAllUseCase = getAllUseCase;
        this.getByIdUseCase = getByIdUseCase;
        this.updateUseCase = updateUseCase;
        this.deleteUseCase = deleteUseCase;
    }
    async create(req, res, next) {
        try {
            const userId = req.user.id;
            const meal = await this.createUseCase.execute(userId, req.body);
            res.status(201).json({ success: true, data: meal });
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            const userId = req.user.id;
            const result = await this.getAllUseCase.execute(userId, res.locals.query ?? req.query);
            res.json({ success: true, ...result });
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const userId = req.user.id;
            const meal = await this.getByIdUseCase.execute(String(req.params['id']), userId);
            res.json({ success: true, data: meal });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const userId = req.user.id;
            const meal = await this.updateUseCase.execute(String(req.params['id']), userId, req.body);
            res.json({ success: true, data: meal });
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const userId = req.user.id;
            await this.deleteUseCase.execute(String(req.params['id']), userId);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MealController = MealController;
