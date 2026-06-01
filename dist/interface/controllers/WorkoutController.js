"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutController = void 0;
class WorkoutController {
    constructor(createUseCase, getAllUseCase, getByIdUseCase, updateUseCase, deleteUseCase) {
        this.createUseCase = createUseCase;
        this.getAllUseCase = getAllUseCase;
        this.getByIdUseCase = getByIdUseCase;
        this.updateUseCase = updateUseCase;
        this.deleteUseCase = deleteUseCase;
    }
    async create(req, res) {
        const userId = req.user.id;
        const workout = await this.createUseCase.execute(userId, req.body);
        res.status(201).json(workout);
    }
    async getAll(req, res) {
        const userId = req.user.id;
        const result = await this.getAllUseCase.execute(userId, req.query);
        res.json(result);
    }
    async getById(req, res) {
        const userId = req.user.id;
        const workoutId = req.params.id;
        const workout = await this.getByIdUseCase.execute(workoutId, userId);
        res.json(workout);
    }
    async update(req, res) {
        const userId = req.user.id;
        const workoutId = req.params.id;
        const workout = await this.updateUseCase.execute(workoutId, userId, req.body);
        res.json(workout);
    }
    async delete(req, res) {
        const userId = req.user.id;
        const workoutId = req.params.id;
        await this.deleteUseCase.execute(workoutId, userId);
        res.status(204).send();
    }
}
exports.WorkoutController = WorkoutController;
