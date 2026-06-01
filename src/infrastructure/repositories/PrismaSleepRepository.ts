import { prisma } from '../database/prisma';
import { SleepLog } from '../../domain/entities/SleepLog';
import { ISleepRepository, SleepFilters } from '../../domain/repositories/ISleepRepository';

export class PrismaSleepRepository implements ISleepRepository {
  async create(data: Omit<SleepLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<SleepLog> {
    return prisma.sleepLog.create({ data });
  }

  async findById(id: string, userId: string): Promise<SleepLog | null> {
    return prisma.sleepLog.findFirst({ where: { id, userId } });
  }

  async findAll(userId: string, skip: number, take: number, filters?: SleepFilters): Promise<SleepLog[]> {
    const where = this.buildWhereClause(userId, filters);
    return prisma.sleepLog.findMany({ where, skip, take, orderBy: { date: 'desc' } });
  }

  async update(
    id: string,
    userId: string,
    data: Partial<Omit<SleepLog, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<SleepLog | null> {
    await prisma.sleepLog.updateMany({ where: { id, userId }, data });
    return this.findById(id, userId);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await prisma.sleepLog.deleteMany({ where: { id, userId } });
    return result.count > 0;
  }

  async count(userId: string, filters?: SleepFilters): Promise<number> {
    const where = this.buildWhereClause(userId, filters);
    return prisma.sleepLog.count({ where });
  }

  private buildWhereClause(userId: string, filters?: SleepFilters): Record<string, unknown> {
    const where: Record<string, unknown> = { userId };

    if (filters?.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.date);
      endOfDay.setHours(23, 59, 59, 999);
      where.date = { gte: startOfDay, lte: endOfDay };
    }

    return where;
  }
}
