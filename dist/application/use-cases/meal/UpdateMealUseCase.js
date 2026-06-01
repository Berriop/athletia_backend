"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMealUseCase = void 0;
class UpdateMealUseCase {
    constructor(mealRepository) {
        this.mealRepository = mealRepository;
    }
    async execute(mealId, userId, data) {
        const existing = await this.mealRepository.findById(mealId, userId);
        if (!existing)
            throw new Error('Meal not found');
        const updated = await this.mealRepository.update(mealId, userId, data);
        if (!updated)
            throw new Error('Failed to update meal');
        return updated;
    }
}
exports.UpdateMealUseCase = UpdateMealUseCase;
