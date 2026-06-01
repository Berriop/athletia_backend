"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInjuryByIdUseCase = void 0;
class GetInjuryByIdUseCase {
    constructor(injuryRepository) {
        this.injuryRepository = injuryRepository;
    }
    async execute(injuryId, userId) {
        const injury = await this.injuryRepository.findById(injuryId, userId);
        if (!injury)
            throw new Error('Injury not found');
        return injury;
    }
}
exports.GetInjuryByIdUseCase = GetInjuryByIdUseCase;
