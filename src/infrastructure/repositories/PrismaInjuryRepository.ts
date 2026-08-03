import { prisma } from '../database/prisma';
import { Injury } from '../../domain/entities/Injury';
import { IInjuryRepository, InjuryFilters } from '../../domain/repositories/IInjuryRepository';

export class PrismaInjuryRepository implements IInjuryRepository {
  async create(data: Omit<Injury, 'id' | 'createdAt' | 'updatedAt'>): Promise<Injury> {
    const created = await prisma.injury.create({ data });
    return created as unknown as Injury;
  }

  async findById(id: string, userId: string): Promise<Injury | null> {
    const injury = await prisma.injury.findFirst({ where: { id, userId } });
    if (!injury) return null;
    return injury as unknown as Injury;
  }

  async findAll(userId: string, skip: number, take: number, filters?: InjuryFilters): Promise<Injury[]> {
    const where = this.buildWhereClause(userId, filters);
    const injuries = await prisma.injury.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } });
    return injuries as unknown as Injury[];
  }

  async update(
    id: string,
    userId: string,
    data: Partial<Omit<Injury, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Injury | null> {
    await prisma.injury.updateMany({ where: { id, userId }, data });
    return this.findById(id, userId);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await prisma.injury.deleteMany({ where: { id, userId } });
    return result.count > 0;
  }

  async count(userId: string, filters?: InjuryFilters): Promise<number> {
    const where = this.buildWhereClause(userId, filters);
    return prisma.injury.count({ where });
  }

  private buildWhereClause(userId: string, filters?: InjuryFilters): Record<string, unknown> {
    const where: Record<string, unknown> = { userId };

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.bodyArea) {
      where.bodyArea = { contains: filters.bodyArea, mode: 'insensitive' };
    }

    return where;
  }
}
