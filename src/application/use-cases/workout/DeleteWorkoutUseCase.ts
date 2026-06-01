import { IWorkoutRepository } from '../../../domain/repositories/IWorkoutRepository';

export class DeleteWorkoutUseCase {
  constructor(private workoutRepository: IWorkoutRepository) {}

  async execute(workoutId: string, userId: string): Promise<void> {
    const existing = await this.workoutRepository.findById(workoutId, userId);
    if (!existing) throw new Error('Workout not found');

    const deleted = await this.workoutRepository.delete(workoutId, userId);
    if (!deleted) throw new Error('Failed to delete workout');
  }
}
