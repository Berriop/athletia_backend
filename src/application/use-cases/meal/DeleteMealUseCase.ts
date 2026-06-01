import { IMealRepository } from '../../../domain/repositories/IMealRepository';

export class DeleteMealUseCase {
  constructor(private mealRepository: IMealRepository) {}

  async execute(mealId: string, userId: string): Promise<void> {
    const existing = await this.mealRepository.findById(mealId, userId);
    if (!existing) throw new Error('Meal not found');

    const deleted = await this.mealRepository.delete(mealId, userId);
    if (!deleted) throw new Error('Failed to delete meal');
  }
}
