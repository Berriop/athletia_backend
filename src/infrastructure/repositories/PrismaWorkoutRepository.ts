import { prisma } from '../database/prisma';
import { Workout } from '../../domain/entities/Workout';
import { IWorkoutRepository, WorkoutFilters } from '../../domain/repositories/IWorkoutRepository';

export class PrismaWorkoutRepository implements IWorkoutRepository {
  async create(data: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workout> {
    const created = await prisma.workout.create({ data });
    return created as unknown as Workout;
  }

  async findById(id: string, userId: string): Promise<Workout | null> {
    const workout = await prisma.workout.findFirst({ where: { id, userId } });
    if (!workout) return null;
    return workout as unknown as Workout;
  }

  async findAll(userId: string, skip: number, take: number, filters?: WorkoutFilters): Promise<Workout[]> {
    const where = this.buildWhereClause(userId, filters);
    const workouts = await prisma.workout.findMany({
      where,
      skip,
      take,
      orderBy: { date: 'desc' },
    });
    return workouts as unknown as Workout[];
  }

  async update(
    id: string,
    userId: string,
    data: Partial<Omit<Workout, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Workout | null> {
    await prisma.workout.updateMany({
      where: { id, userId },
      data,
    });
    return this.findById(id, userId);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await prisma.workout.deleteMany({ where: { id, userId } });
    return result.count > 0;
  }

  async count(userId: string, filters?: WorkoutFilters): Promise<number> {
    const where = this.buildWhereClause(userId, filters);
    return prisma.workout.count({ where });
  }

  private buildWhereClause(userId: string, filters?: WorkoutFilters): Record<string, unknown> {
    const where: Record<string, unknown> = { userId };

    if (filters?.bodyPart) {
      where.bodyPart = filters.bodyPart;
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
