import { IMealRepository } from '../../../domain/repositories/IMealRepository';
import { Meal } from '../../../domain/entities/Meal';

export class GetMealByIdUseCase {
  constructor(private mealRepository: IMealRepository) {}

  async execute(mealId: string, userId: string): Promise<Meal> {
    const meal = await this.mealRepository.findById(mealId, userId);
    if (!meal) throw new Error('Meal not found');
    return meal;
  }
}
