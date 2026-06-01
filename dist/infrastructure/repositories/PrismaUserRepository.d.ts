import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
export declare class PrismaUserRepository implements IUserRepository {
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
}
