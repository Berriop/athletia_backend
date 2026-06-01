import { prisma } from '../database/prisma';
import { Workout } from '../../domain/entities/Workout';
import { IWorkoutRepository, WorkoutFilters } from '../../domain/repositories/IWorkoutRepository';

export class PrismaWorkoutRepository implements IWorkoutRepository {
  async create(data: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workout> {
    return prisma.workout.create({ data });
  }

  async findById(id: string, userId: string): Promise<Workout | null> {
    return prisma.workout.findFirst({ where: { id, userId } });
  }

  async findAll(userId: string, skip: number, take: number, filters?: WorkoutFilters): Promise<Workout[]> {
    const where: any = { userId };
    if (filters?.bodyPart) where.bodyPart = { contains: filters.bodyPart, mode: 'insensitive' };
    if (filters?.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.date);
      endOfDay.setHours(23, 59, 59, 999);
      where.date = { gte: startOfDay, lte: endOfDay };
    }

    return prisma.workout.findMany({ where, skip, take, orderBy: { date: 'desc' } });
  }

  async update(id: string, userId: string, data: Partial<Omit<Workout, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<Workout | null> {
    return prisma.workout.updateMany({
      where: { id, userId },
      data,
    }).then(() => this.findById(id, userId));
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await prisma.workout.deleteMany({ where: { id, userId } });
    return result.count > 0;
  }

  async count(userId: string, filters?: WorkoutFilters): Promise<number> {
    const where: any = { userId };
    if (filters?.bodyPart) where.bodyPart = { contains: filters.bodyPart, mode: 'insensitive' };
    if (filters?.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.date);
      endOfDay.setHours(23, 59, 59, 999);
      where.date = { gte: startOfDay, lte: endOfDay };
    }

    return prisma.workout.count({ where });
  }
}
