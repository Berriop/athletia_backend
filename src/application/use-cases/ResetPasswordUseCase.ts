import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { ValidationError } from '../../domain/errors/AppError';
import bcrypt from 'bcrypt';

export class ResetPasswordUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(token: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findByResetToken(token);
    
    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new ValidationError('Token inválido o expirado');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await this.userRepository.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    } as any);
  }
}
