import { IMealRepository } from '../../../domain/repositories/IMealRepository';
import { Meal } from '../../../domain/entities/Meal';
import { NotFoundError } from '../../../domain/errors/AppError';

export class GetMealByIdUseCase {
  constructor(private readonly mealRepository: IMealRepository) {}

  async execute(mealId: string, userId: string): Promise<Meal> {
    const meal = await this.mealRepository.findById(mealId, userId);
    if (!meal) throw new NotFoundError('Comida no encontrada');
    return meal;
  }
}
