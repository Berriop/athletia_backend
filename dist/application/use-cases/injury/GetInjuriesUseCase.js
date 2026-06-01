"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInjuriesUseCase = void 0;
class GetInjuriesUseCase {
    constructor(injuryRepository) {
        this.injuryRepository = injuryRepository;
    }
    async execute(userId, queryParams) {
        const page = queryParams.page || 1;
        const limit = queryParams.limit || 10;
        const skip = (page - 1) * limit;
        const filters = {};
        if (queryParams.isActive !== undefined)
            filters.isActive = queryParams.isActive;
        if (queryParams.bodyArea)
            filters.bodyArea = queryParams.bodyArea;
        const [injuries, total] = await Promise.all([
            this.injuryRepository.findAll(userId, skip, limit, filters),
            this.injuryRepository.count(userId, filters),
        ]);
        return {
            data: injuries,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
}
exports.GetInjuriesUseCase = GetInjuriesUseCase;
