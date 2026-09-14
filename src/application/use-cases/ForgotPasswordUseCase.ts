import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IEmailService } from '../../infrastructure/services/EmailService';
import { ForbiddenError } from '../../domain/errors/AppError';
import crypto from 'node:crypto';

export class ForgotPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailService
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return;
    }

    if (user.isBlocked) {
      throw new ForbiddenError('Usuario bloqueado');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

    // This method needs to be implemented in repository
    await this.userRepository.update(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires,
    } as any);

    await this.emailService.sendPasswordResetEmail(email, resetToken);
  }
}
