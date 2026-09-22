import { prisma } from '../database/prisma';
import { SleepLog } from '../../domain/entities/SleepLog';
import { ISleepRepository, SleepFilters } from '../../domain/repositories/ISleepRepository';
import { PrismaCrudRepository } from './PrismaCrudRepository';
import { buildDayRange } from './dateRangeFilter';

export class PrismaSleepRepository extends PrismaCrudRepository<SleepLog, SleepFilters> implements ISleepRepository {
  protected readonly model = prisma.sleepLog;
  protected readonly orderBy = { date: 'desc' as const };

  protected buildWhereClause(userId: string, filters?: SleepFilters): Record<string, unknown> {
    const where: Record<string, unknown> = { userId };

    if (filters?.date) {
      where.date = buildDayRange(filters.date);
    }

    return where;
  }
}
