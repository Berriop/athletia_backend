import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';

export type UpdateProfileDTO = Partial<Pick<User, 'name' | 'gender' | 'birthDate' | 'heightCm' | 'weightKg' | 'experienceLevel'>>;

export class UpdateProfileUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string, data: UpdateProfileDTO) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updated = await this.userRepository.update(userId, data);
    const { password: _, ...userWithoutPassword } = updated;
    return { user: userWithoutPassword };
  }
}
