"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSleepUseCase = void 0;
class UpdateSleepUseCase {
    constructor(sleepRepository) {
        this.sleepRepository = sleepRepository;
    }
    async execute(sleepId, userId, data) {
        const existing = await this.sleepRepository.findById(sleepId, userId);
        if (!existing)
            throw new Error('Sleep not found');
        const updated = await this.sleepRepository.update(sleepId, userId, data);
        if (!updated)
            throw new Error('Failed to update sleep');
        return updated;
    }
}
exports.UpdateSleepUseCase = UpdateSleepUseCase;
