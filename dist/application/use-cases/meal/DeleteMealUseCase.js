"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteMealUseCase = void 0;
class DeleteMealUseCase {
    constructor(mealRepository) {
        this.mealRepository = mealRepository;
    }
    async execute(mealId, userId) {
        const existing = await this.mealRepository.findById(mealId, userId);
        if (!existing)
            throw new Error('Meal not found');
        const deleted = await this.mealRepository.delete(mealId, userId);
        if (!deleted)
            throw new Error('Failed to delete meal');
    }
}
exports.DeleteMealUseCase = DeleteMealUseCase;
