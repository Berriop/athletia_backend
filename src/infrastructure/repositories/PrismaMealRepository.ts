import { prisma } from '../database/prisma';
import { Meal } from '../../domain/entities/Meal';
import { IMealRepository, MealFilters } from '../../domain/repositories/IMealRepository';

export class PrismaMealRepository implements IMealRepository {
  async create(data: Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Meal> {
    return prisma.meal.create({ data });
  }

  async findById(id: string, userId: string): Promise<Meal | null> {
    return prisma.meal.findFirst({ where: { id, userId } });
  }

  async findAll(userId: string, skip: number, take: number, filters?: MealFilters): Promise<Meal[]> {
    const where = this.buildWhereClause(userId, filters);
    return prisma.meal.findMany({ where, skip, take, orderBy: { date: 'desc' } });
  }

  async update(
    id: string,
    userId: string,
    data: Partial<Omit<Meal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Meal | null> {
    await prisma.meal.updateMany({ where: { id, userId }, data });
    return this.findById(id, userId);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await prisma.meal.deleteMany({ where: { id, userId } });
    return result.count > 0;
  }

  async count(userId: string, filters?: MealFilters): Promise<number> {
    const where = this.buildWhereClause(userId, filters);
    return prisma.meal.count({ where });
  }

  // Extracted to avoid duplication between findAll and count
  private buildWhereClause(userId: string, filters?: MealFilters): Record<string, unknown> {
    const where: Record<string, unknown> = { userId };

    if (filters?.mealType) {
      where.mealType = filters.mealType;
    }

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
