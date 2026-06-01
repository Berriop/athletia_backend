"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMealUseCase = void 0;
class CreateMealUseCase {
    constructor(mealRepository) {
        this.mealRepository = mealRepository;
    }
    async execute(userId, data) {
        return this.mealRepository.create({ ...data, userId });
    }
}
exports.CreateMealUseCase = CreateMealUseCase;
