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
      data: {
        email: data.email,
        password: data.password!,
        name: data.name,
        birthDate: data.birthDate,
        gender: data.gender,
        heightCm: data.heightCm,
        weightKg: data.weightKg,
        experienceLevel: data.experienceLevel,
        role: data.role,
      },
    });
    return user as unknown as User;
  }

  async update(
    id: string,
    data: Partial<Omit<User, 'id' | 'email' | 'password' | 'role' | 'createdAt' | 'updatedAt'>>,
  ): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data,
    });
    return user as unknown as User;
  }
}
