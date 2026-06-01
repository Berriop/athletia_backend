"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMealByIdUseCase = void 0;
class GetMealByIdUseCase {
    constructor(mealRepository) {
        this.mealRepository = mealRepository;
    }
    async execute(mealId, userId) {
        const meal = await this.mealRepository.findById(mealId, userId);
        if (!meal)
            throw new Error('Meal not found');
        return meal;
    }
}
exports.GetMealByIdUseCase = GetMealByIdUseCase;
