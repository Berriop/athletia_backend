import { IWorkoutRepository } from '../../../domain/repositories/IWorkoutRepository';
import { NotFoundError } from '../../../domain/errors/AppError';

export class DeleteWorkoutUseCase {
  constructor(private readonly workoutRepository: IWorkoutRepository) {}

  async execute(workoutId: string, userId: string): Promise<void> {
    const existing = await this.workoutRepository.findById(workoutId, userId);
    if (!existing) throw new NotFoundError('Entrenamiento no encontrado');

    const deleted = await this.workoutRepository.delete(workoutId, userId);
    if (!deleted) throw new NotFoundError('Entrenamiento no encontrado');
  }
}
