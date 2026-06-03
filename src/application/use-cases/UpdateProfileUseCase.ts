import { IUserRepository } from '../../domain/repositories/IUserRepository';

export interface UpdateProfileDTO {
  name?: string | null;
  gender?: string | null;
  birthDate?: string | null;   // comes as ISO string from the client
  heightCm?: number | null;
  weightKg?: number | null;
  experienceLevel?: string | null;
}

export class UpdateProfileUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string, data: UpdateProfileDTO) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Prisma expects a Date object, not a string
    const payload: Record<string, unknown> = { ...data };
    if (data.birthDate) {
      payload.birthDate = new Date(data.birthDate);
    } else if (data.birthDate === null || data.birthDate === '') {
      payload.birthDate = null;
    }

    const updated = await this.userRepository.update(userId, payload as any);
    const { password: _, ...userWithoutPassword } = updated;
    return { user: userWithoutPassword };
  }
}
