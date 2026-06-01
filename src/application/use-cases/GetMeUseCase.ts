import { IUserRepository } from '../../domain/repositories/IUserRepository';

export class GetMeUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword };
  }
}
