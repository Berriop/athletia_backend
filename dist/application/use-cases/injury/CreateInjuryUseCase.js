"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateInjuryUseCase = void 0;
class CreateInjuryUseCase {
    constructor(injuryRepository) {
        this.injuryRepository = injuryRepository;
    }
    async execute(userId, data) {
        const injuryData = {
            ...data,
            userId,
            notes: data.notes ?? null,
        };
        return this.injuryRepository.create(injuryData);
    }
}
exports.CreateInjuryUseCase = CreateInjuryUseCase;
