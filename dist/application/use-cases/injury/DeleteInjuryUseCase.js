"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteInjuryUseCase = void 0;
class DeleteInjuryUseCase {
    constructor(injuryRepository) {
        this.injuryRepository = injuryRepository;
    }
    async execute(injuryId, userId) {
        const existing = await this.injuryRepository.findById(injuryId, userId);
        if (!existing)
            throw new Error('Injury not found');
        const deleted = await this.injuryRepository.delete(injuryId, userId);
        if (!deleted)
            throw new Error('Failed to delete injury');
    }
}
exports.DeleteInjuryUseCase = DeleteInjuryUseCase;
