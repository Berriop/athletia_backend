import { IMealRepository } from '../../../domain/repositories/IMealRepository';
import { Meal } from '../../../domain/entities/Meal';
import { UpdateMealDTO } from '../../dto/meal.dto';

export class UpdateMealUseCase {
  constructor(private mealRepository: IMealRepository) {}

  async execute(mealId: string, userId: string, data: UpdateMealDTO): Promise<Meal> {
    const existing = await this.mealRepository.findById(mealId, userId);
    if (!existing) throw new Error('Meal not found');

    const updated = await this.mealRepository.update(mealId, userId, data);
    if (!updated) throw new Error('Failed to update meal');
    return updated;
  }
}
