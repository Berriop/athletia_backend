import { Injury } from '../../domain/entities/Injury';
import { IInjuryRepository, InjuryFilters } from '../../domain/repositories/IInjuryRepository';
export declare class PrismaInjuryRepository implements IInjuryRepository {
    create(data: Omit<Injury, 'id' | 'createdAt' | 'updatedAt'>): Promise<Injury>;
    findById(id: string, userId: string): Promise<Injury | null>;
    findAll(userId: string, skip: number, take: number, filters?: InjuryFilters): Promise<Injury[]>;
    update(id: string, userId: string, data: Partial<Omit<Injury, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<Injury | null>;
    delete(id: string, userId: string): Promise<boolean>;
    count(userId: string, filters?: InjuryFilters): Promise<number>;
    private buildWhereClause;
}
