import { ICrudRepository } from '../../domain/repositories/ICrudRepository';

interface PrismaCrudDelegate {
  create(args: { data: any }): Promise<any>;
  findFirst(args: { where: any }): Promise<any>;
  findMany(args: { where: any; skip: number; take: number; orderBy: any }): Promise<any[]>;
  updateMany(args: { where: any; data: any }): Promise<{ count: number }>;
  deleteMany(args: { where: any }): Promise<{ count: number }>;
  count(args: { where: any }): Promise<number>;
}

// Implementaciones concretas (PrismaSleepRepository, PrismaWorkoutRepository, etc.)
// solo necesitan proveer el delegate de Prisma, el orderBy y su buildWhereClause;
// el resto del CRUD (create/findById/findAll/update/delete/count) es idéntico
// para todas las entidades con forma { id, userId, createdAt, updatedAt }.
export abstract class PrismaCrudRepository<T, Filters> implements ICrudRepository<T, Filters> {
  protected abstract readonly model: PrismaCrudDelegate;
  protected abstract readonly orderBy: Record<string, 'asc' | 'desc'>;
  protected abstract buildWhereClause(userId: string, filters?: Filters): Record<string, unknown>;

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const created = await this.model.create({ data });
    return created as T;
  }

  async findById(id: string, userId: string): Promise<T | null> {
    const record = await this.model.findFirst({ where: { id, userId } });
    return record ? (record as T) : null;
  }

  async findAll(userId: string, skip: number, take: number, filters?: Filters): Promise<T[]> {
    const where = this.buildWhereClause(userId, filters);
    const records = await this.model.findMany({ where, skip, take, orderBy: this.orderBy });
    return records as T[];
  }

  async update(
    id: string,
    userId: string,
    data: Partial<Omit<T, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<T | null> {
    await this.model.updateMany({ where: { id, userId }, data });
    return this.findById(id, userId);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.model.deleteMany({ where: { id, userId } });
    return result.count > 0;
  }

  async count(userId: string, filters?: Filters): Promise<number> {
    const where = this.buildWhereClause(userId, filters);
    return this.model.count({ where });
  }
}
