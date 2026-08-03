import { prisma } from '../database/prisma';
import { Meal } from '../../domain/entities/Meal';
import { IMealRepository, MealFilters } from '../../domain/repositories/IMealRepository';

export class PrismaMealRepository implements IMealRepository {
  async create(data: Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Meal> {
    const created = await prisma.meal.create({ data });
    return created as unknown as Meal;
  }

  async findById(id: string, userId: string): Promise<Meal | null> {
    const meal = await prisma.meal.findFirst({ where: { id, userId } });
    if (!meal) return null;
    return meal as unknown as Meal;
  }

  async findAll(userId: string, skip: number, take: number, filters?: MealFilters): Promise<Meal[]> {
    const where = this.buildWhereClause(userId, filters);
    const meals = await prisma.meal.findMany({ where, skip, take, orderBy: { date: 'desc' } });
    return meals as unknown as Meal[];
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
