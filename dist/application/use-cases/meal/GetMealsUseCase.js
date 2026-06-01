"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMealsUseCase = void 0;
class GetMealsUseCase {
    constructor(mealRepository) {
        this.mealRepository = mealRepository;
    }
    async execute(userId, queryParams) {
        const page = queryParams.page || 1;
        const limit = queryParams.limit || 10;
        const skip = (page - 1) * limit;
        const filters = {};
        if (queryParams.mealType)
            filters.mealType = queryParams.mealType;
        if (queryParams.date)
            filters.date = new Date(queryParams.date);
        const [meals, total] = await Promise.all([
            this.mealRepository.findAll(userId, skip, limit, filters),
            this.mealRepository.count(userId, filters),
        ]);
        return {
            data: meals,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
}
exports.GetMealsUseCase = GetMealsUseCase;
