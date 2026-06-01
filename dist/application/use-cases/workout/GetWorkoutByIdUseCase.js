"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetWorkoutByIdUseCase = void 0;
class GetWorkoutByIdUseCase {
    constructor(workoutRepository) {
        this.workoutRepository = workoutRepository;
    }
    async execute(workoutId, userId) {
        const workout = await this.workoutRepository.findById(workoutId, userId);
        if (!workout)
            throw new Error('Workout not found');
        return workout;
    }
}
exports.GetWorkoutByIdUseCase = GetWorkoutByIdUseCase;
