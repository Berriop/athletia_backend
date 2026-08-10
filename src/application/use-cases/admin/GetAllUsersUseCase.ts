import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/entities/User';

export class GetAllUsersUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userRepository.findAll();
    return users.map(({ password, ...user }) => user);
  }
}
