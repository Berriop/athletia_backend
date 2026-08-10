import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { prisma } from '../database/prisma';

export class PrismaUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) return null;
    return user as unknown as User;
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) return null;
    return user as unknown as User;
  }

  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user = await prisma.user.create({
      data: data as any,
    });
    return user as unknown as User;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data: data as any,
    });
    return user as unknown as User;
  }

  async findByResetToken(token: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: { resetPasswordToken: token }
    });
    if (!user) return null;
    return user as unknown as User;
  }

  async findByEmailVerificationToken(token: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token }
    });
    if (!user) return null;
    return user as unknown as User;
  }

  async findAll(): Promise<User[]> {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return users as unknown as User[];
  }
}
