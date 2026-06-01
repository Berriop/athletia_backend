"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSleepByIdUseCase = void 0;
class GetSleepByIdUseCase {
    constructor(sleepRepository) {
        this.sleepRepository = sleepRepository;
    }
    async execute(sleepId, userId) {
        const sleep = await this.sleepRepository.findById(sleepId, userId);
        if (!sleep)
            throw new Error('Sleep not found');
        return sleep;
    }
}
exports.GetSleepByIdUseCase = GetSleepByIdUseCase;
