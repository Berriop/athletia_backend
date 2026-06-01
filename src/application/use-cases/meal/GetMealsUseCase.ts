import { IMealRepository, MealFilters } from '../../../domain/repositories/IMealRepository';
import { Meal } from '../../../domain/entities/Meal';
import { QueryMealDTO } from '../../dto/meal.dto';

export interface GetMealsResponse {
  data: Meal[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export class GetMealsUseCase {
  constructor(private mealRepository: IMealRepository) {}

  async execute(userId: string, queryParams: QueryMealDTO): Promise<GetMealsResponse> {
    const page = queryParams.page || 1;
    const limit = queryParams.limit || 10;
    const skip = (page - 1) * limit;

    const filters: MealFilters = {};
    if (queryParams.mealType) filters.mealType = queryParams.mealType;
    if (queryParams.date) filters.date = new Date(queryParams.date);

    const [meals, total] = await Promise.all([
      this.mealRepository.findAll(userId, skip, limit, filters),
      this.mealRepository.count(userId, filters),
    ]);

    return {
      data: meals,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
