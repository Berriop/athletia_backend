import { prisma } from '../database/prisma';
import { Workout } from '../../domain/entities/Workout';
import { IWorkoutRepository, WorkoutFilters } from '../../domain/repositories/IWorkoutRepository';
import { PrismaCrudRepository } from './PrismaCrudRepository';
import { buildDayRange } from './dateRangeFilter';

export class PrismaWorkoutRepository extends PrismaCrudRepository<Workout, WorkoutFilters> implements IWorkoutRepository {
  protected readonly model = prisma.workout;
  protected readonly orderBy = { date: 'desc' as const };

  protected buildWhereClause(userId: string, filters?: WorkoutFilters): Record<string, unknown> {
    const where: Record<string, unknown> = { userId };

    if (filters?.bodyPart) {
      where.bodyPart = filters.bodyPart;
    }

    if (filters?.date) {
      where.date = buildDayRange(filters.date);
    }

    return where;
  }
}
