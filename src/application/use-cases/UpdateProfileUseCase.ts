import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { NotFoundError } from '../../domain/errors/AppError';

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
      throw new NotFoundError('User not found');
    }

    // Build the update payload, converting birthDate string to Date
    const { birthDate, gender, experienceLevel, ...rest } = data;
    const payload: Record<string, unknown> = { ...rest };

    if (birthDate) {
      payload.birthDate = new Date(birthDate);
    } else if (birthDate === null || birthDate === '') {
      payload.birthDate = null;
    }

    // Normalize enums to uppercase as required by Prisma schema
    if (gender) {
      payload.gender = gender.toUpperCase();
    } else if (gender === null || gender === '') {
      payload.gender = null;
    }

    if (experienceLevel) {
      payload.experienceLevel = experienceLevel.toUpperCase();
    } else if (experienceLevel === null || experienceLevel === '') {
      payload.experienceLevel = null;
    }

    const updated = await this.userRepository.update(userId, payload as Parameters<IUserRepository['update']>[1]);
    const { password: _, ...userWithoutPassword } = updated;
    return { user: userWithoutPassword };
  }
}

