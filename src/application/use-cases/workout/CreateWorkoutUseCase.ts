import { IWorkoutRepository } from '../../../domain/repositories/IWorkoutRepository';
import { Workout } from '../../../domain/entities/Workout';
import { CreateWorkoutDTO } from '../../dto/workout.dto';

export class CreateWorkoutUseCase {
  constructor(private readonly workoutRepository: IWorkoutRepository) {}

  async execute(userId: string, data: CreateWorkoutDTO): Promise<Workout> {
    const workoutData = {
      ...data,
      userId,
      description: data.description ?? null,
    };
    return this.workoutRepository.create(workoutData);
  }
}
