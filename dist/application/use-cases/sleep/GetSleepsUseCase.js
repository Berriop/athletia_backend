"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSleepsUseCase = void 0;
class GetSleepsUseCase {
    constructor(sleepRepository) {
        this.sleepRepository = sleepRepository;
    }
    async execute(userId, queryParams) {
        const page = queryParams.page || 1;
        const limit = queryParams.limit || 10;
        const skip = (page - 1) * limit;
        const filters = {};
        if (queryParams.date)
            filters.date = new Date(queryParams.date);
        const [sleeps, total] = await Promise.all([
            this.sleepRepository.findAll(userId, skip, limit, filters),
            this.sleepRepository.count(userId, filters),
        ]);
        return {
            data: sleeps,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
}
exports.GetSleepsUseCase = GetSleepsUseCase;
