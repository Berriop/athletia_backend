import { IMealRepository } from '../../../domain/repositories/IMealRepository';
import { Meal } from '../../../domain/entities/Meal';
import { CreateMealDTO } from '../../dto/meal.dto';

export class CreateMealUseCase {
  constructor(private readonly mealRepository: IMealRepository) {}

  async execute(userId: string, data: CreateMealDTO): Promise<Meal> {
    return this.mealRepository.create({ ...data, userId });
  }
}
