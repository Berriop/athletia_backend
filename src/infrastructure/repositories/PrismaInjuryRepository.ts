import { prisma } from '../database/prisma';
import { Injury } from '../../domain/entities/Injury';
import { IInjuryRepository, InjuryFilters } from '../../domain/repositories/IInjuryRepository';
import { PrismaCrudRepository } from './PrismaCrudRepository';

export class PrismaInjuryRepository extends PrismaCrudRepository<Injury, InjuryFilters> implements IInjuryRepository {
  protected readonly model = prisma.injury;
  protected readonly orderBy = { createdAt: 'desc' as const };

  protected buildWhereClause(userId: string, filters?: InjuryFilters): Record<string, unknown> {
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
