"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetWorkoutsUseCase = void 0;
class GetWorkoutsUseCase {
    constructor(workoutRepository) {
        this.workoutRepository = workoutRepository;
    }
    async execute(userId, queryParams) {
        const page = queryParams.page || 1;
        const limit = queryParams.limit || 10;
        const skip = (page - 1) * limit;
        const filters = {};
        if (queryParams.bodyPart)
            filters.bodyPart = queryParams.bodyPart;
        if (queryParams.date)
            filters.date = new Date(queryParams.date);
        const [workouts, total] = await Promise.all([
            this.workoutRepository.findAll(userId, skip, limit, filters),
            this.workoutRepository.count(userId, filters),
        ]);
        return {
            data: workouts,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
}
exports.GetWorkoutsUseCase = GetWorkoutsUseCase;
