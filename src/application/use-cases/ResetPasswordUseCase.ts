import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IHashService } from '../../domain/services/IHashService';
import { ValidationError } from '../../domain/errors/AppError';

export class ResetPasswordUseCase {
  constructor(
    private userRepository: IUserRepository,
    private hashService: IHashService,
  ) {}

  async execute(token: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findByResetToken(token);

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new ValidationError('Token inválido o expirado');
    }

    const hashedPassword = await this.hashService.hash(newPassword);

    await this.userRepository.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });
  }
}