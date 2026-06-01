"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteWorkoutUseCase = void 0;
class DeleteWorkoutUseCase {
    constructor(workoutRepository) {
        this.workoutRepository = workoutRepository;
    }
    async execute(workoutId, userId) {
        const existing = await this.workoutRepository.findById(workoutId, userId);
        if (!existing)
            throw new Error('Workout not found');
        const deleted = await this.workoutRepository.delete(workoutId, userId);
        if (!deleted)
            throw new Error('Failed to delete workout');
    }
}
exports.DeleteWorkoutUseCase = DeleteWorkoutUseCase;
