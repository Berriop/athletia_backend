import { Meal } from '../../domain/entities/Meal';
import { IMealRepository, MealFilters } from '../../domain/repositories/IMealRepository';
export declare class PrismaMealRepository implements IMealRepository {
    create(data: Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Meal>;
    findById(id: string, userId: string): Promise<Meal | null>;
    findAll(userId: string, skip: number, take: number, filters?: MealFilters): Promise<Meal[]>;
    update(id: string, userId: string, data: Partial<Omit<Meal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<Meal | null>;
    delete(id: string, userId: string): Promise<boolean>;
    count(userId: string, filters?: MealFilters): Promise<number>;
    private buildWhereClause;
}
