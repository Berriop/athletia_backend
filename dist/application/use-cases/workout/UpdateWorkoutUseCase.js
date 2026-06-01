"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateWorkoutUseCase = void 0;
class UpdateWorkoutUseCase {
    constructor(workoutRepository) {
        this.workoutRepository = workoutRepository;
    }
    async execute(workoutId, userId, data) {
        const existing = await this.workoutRepository.findById(workoutId, userId);
        if (!existing)
            throw new Error('Workout not found');
        const updated = await this.workoutRepository.update(workoutId, userId, data);
        if (!updated)
            throw new Error('Failed to update workout');
        return updated;
    }
}
exports.UpdateWorkoutUseCase = UpdateWorkoutUseCase;
