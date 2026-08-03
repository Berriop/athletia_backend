import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { NotFoundError } from '../../domain/errors/AppError';

export class GetMeUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword };
  }
}
