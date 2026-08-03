import { IWorkoutRepository } from '../../../domain/repositories/IWorkoutRepository';
import { Workout } from '../../../domain/entities/Workout';
import { NotFoundError } from '../../../domain/errors/AppError';

export class GetWorkoutByIdUseCase {
  constructor(private workoutRepository: IWorkoutRepository) {}

  async execute(workoutId: string, userId: string): Promise<Workout> {
    const workout = await this.workoutRepository.findById(workoutId, userId);
    if (!workout) throw new NotFoundError('Workout not found');
    return workout;
  }
}
