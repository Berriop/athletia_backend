import { prisma } from '../database/prisma';
import { Meal } from '../../domain/entities/Meal';
import { IMealRepository, MealFilters } from '../../domain/repositories/IMealRepository';
import { PrismaCrudRepository } from './PrismaCrudRepository';
import { buildDayRange } from './dateRangeFilter';

export class PrismaMealRepository extends PrismaCrudRepository<Meal, MealFilters> implements IMealRepository {
  protected readonly model = prisma.meal;
  protected readonly orderBy = { date: 'desc' as const };

  protected buildWhereClause(userId: string, filters?: MealFilters): Record<string, unknown> {
    const where: Record<string, unknown> = { userId };

    if (filters?.mealType) {
      where.mealType = filters.mealType;
    }

    if (filters?.date) {
      where.date = buildDayRange(filters.date);
    }

    return where;
  }
}
