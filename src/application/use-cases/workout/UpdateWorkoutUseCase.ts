import { IWorkoutRepository } from '../../../domain/repositories/IWorkoutRepository';
import { Workout } from '../../../domain/entities/Workout';
import { UpdateWorkoutDTO } from '../../dto/workout.dto';
import { NotFoundError } from '../../../domain/errors/AppError';

export class UpdateWorkoutUseCase {
  constructor(private readonly workoutRepository: IWorkoutRepository) {}

  async execute(workoutId: string, userId: string, data: UpdateWorkoutDTO): Promise<Workout> {
    const existing = await this.workoutRepository.findById(workoutId, userId);
    if (!existing) throw new NotFoundError('Workout not found');

    const updated = await this.workoutRepository.update(workoutId, userId, data);
    if (!updated) throw new NotFoundError('Workout not found');
    return updated;
  }
}
