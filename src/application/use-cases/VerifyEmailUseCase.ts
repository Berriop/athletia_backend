import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { ValidationError } from '../../domain/errors/AppError';

export class VerifyEmailUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(token: string): Promise<void> {
    const user = await this.userRepository.findByEmailVerificationToken(token);
    
    if (!user) {
      throw new ValidationError('Token de verificación inválido o expirado');
    }

    if (user.isEmailVerified) {
      return; // Ya está verificado
    }

    await this.userRepository.update(user.id, {
      isEmailVerified: true,
      emailVerificationToken: null
    } as any);
  }
}
