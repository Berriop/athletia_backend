"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSleepUseCase = void 0;
class CreateSleepUseCase {
    constructor(sleepRepository) {
        this.sleepRepository = sleepRepository;
    }
    async execute(userId, data) {
        const sleepData = {
            ...data,
            userId,
            notes: data.notes ?? null,
        };
        return this.sleepRepository.create(sleepData);
    }
}
exports.CreateSleepUseCase = CreateSleepUseCase;
