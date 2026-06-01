"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateInjuryUseCase = void 0;
class UpdateInjuryUseCase {
    constructor(injuryRepository) {
        this.injuryRepository = injuryRepository;
    }
    async execute(injuryId, userId, data) {
        const existing = await this.injuryRepository.findById(injuryId, userId);
        if (!existing)
            throw new Error('Injury not found');
        const updated = await this.injuryRepository.update(injuryId, userId, data);
        if (!updated)
            throw new Error('Failed to update injury');
        return updated;
    }
}
exports.UpdateInjuryUseCase = UpdateInjuryUseCase;
