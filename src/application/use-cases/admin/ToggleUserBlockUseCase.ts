import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/entities/User';
import { NotFoundError, ForbiddenError } from '../../../domain/errors/AppError';

export class ToggleUserBlockUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string, adminUserId?: string): Promise<Omit<User, 'password'>> {
    if (adminUserId && userId === adminUserId) {
      throw new ForbiddenError('No puedes bloquear tu propia cuenta de administrador');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    const updated = await this.userRepository.update(user.id, {
      isBlocked: !user.isBlocked,
    });

    const { password: _, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }
}
