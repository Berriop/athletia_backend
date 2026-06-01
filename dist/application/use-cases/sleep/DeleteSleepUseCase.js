"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteSleepUseCase = void 0;
class DeleteSleepUseCase {
    constructor(sleepRepository) {
        this.sleepRepository = sleepRepository;
    }
    async execute(sleepId, userId) {
        const existing = await this.sleepRepository.findById(sleepId, userId);
        if (!existing)
            throw new Error('Sleep not found');
        const deleted = await this.sleepRepository.delete(sleepId, userId);
        if (!deleted)
            throw new Error('Failed to delete sleep');
    }
}
exports.DeleteSleepUseCase = DeleteSleepUseCase;
