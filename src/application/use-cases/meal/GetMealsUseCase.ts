import { IMealRepository, MealFilters } from '../../../domain/repositories/IMealRepository';
import { Meal } from '../../../domain/entities/Meal';
import { QueryMealDTO } from '../../dto/meal.dto';
import { resolvePagination, buildPaginatedResult, PaginatedResult } from '../pagination';

export type GetMealsResponse = PaginatedResult<Meal>;

export class GetMealsUseCase {
  constructor(private mealRepository: IMealRepository) {}

  async execute(userId: string, queryParams: QueryMealDTO): Promise<GetMealsResponse> {
    const { page, limit, skip } = resolvePagination(queryParams);

    const filters: MealFilters = {};
    if (queryParams.mealType) filters.mealType = queryParams.mealType;
    if (queryParams.date) filters.date = new Date(queryParams.date);

    const [meals, total] = await Promise.all([
      this.mealRepository.findAll(userId, skip, limit, filters),
      this.mealRepository.count(userId, filters),
    ]);

    return buildPaginatedResult(meals, page, limit, total);
  }
}
