import { IWorkoutRepository } from '../../../domain/repositories/IWorkoutRepository';
import { Workout } from '../../../domain/entities/Workout';
import { UpdateWorkoutDTO } from '../../dto/workout.dto';

export class UpdateWorkoutUseCase {
  constructor(private workoutRepository: IWorkoutRepository) {}

  async execute(workoutId: string, userId: string, data: UpdateWorkoutDTO): Promise<Workout> {
    const existing = await this.workoutRepository.findById(workoutId, userId);
    if (!existing) throw new Error('Workout not found');

    const updated = await this.workoutRepository.update(workoutId, userId, data);
    if (!updated) throw new Error('Failed to update workout');
    return updated;
  }
}
