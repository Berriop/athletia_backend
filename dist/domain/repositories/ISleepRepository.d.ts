import { SleepLog } from '../entities/SleepLog';
export interface SleepFilters {
    date?: Date;
}
export interface ISleepRepository {
    create(data: Omit<SleepLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<SleepLog>;
    findById(id: string, userId: string): Promise<SleepLog | null>;
    findAll(userId: string, skip: number, take: number, filters?: SleepFilters): Promise<SleepLog[]>;
    update(id: string, userId: string, data: Partial<Omit<SleepLog, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<SleepLog | null>;
    delete(id: string, userId: string): Promise<boolean>;
    count(userId: string, filters?: SleepFilters): Promise<number>;
}
