"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateWorkoutUseCase = void 0;
class CreateWorkoutUseCase {
    constructor(workoutRepository) {
        this.workoutRepository = workoutRepository;
    }
    async execute(userId, data) {
        const workoutData = {
            ...data,
            userId,
            description: data.description ?? null,
        };
        return this.workoutRepository.create(workoutData);
    }
}
exports.CreateWorkoutUseCase = CreateWorkoutUseCase;
