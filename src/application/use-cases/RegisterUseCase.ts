import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IHashService } from '../../domain/services/IHashService';
import { IJwtService } from '../../domain/services/IJwtService';
import { IEmailService } from '../../infrastructure/services/EmailService';
import { RegisterDTO } from '../dto/auth.dto';
import { ConflictError } from '../../domain/errors/AppError';
import crypto from 'crypto';

export class RegisterUseCase {
  constructor(
    private userRepository: IUserRepository,
    private hashService: IHashService,
    private jwtService: IJwtService,
    private emailService: IEmailService
  ) {}

  async execute(data: RegisterDTO) {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('Email already in use');
    }

    const hashedPassword = await this.hashService.hash(data.password);
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    const userToCreate = {
      email: data.email,
      password: hashedPassword,
      name: data.name ?? null,
      birthDate: data.birthDate ?? null,
      gender: data.gender ?? null,
      heightCm: data.heightCm ?? null,
      weightKg: data.weightKg ?? null,
      experienceLevel: data.experienceLevel ?? null,
      role: 'USER' as const,
      isEmailVerified: false,
      emailVerificationToken,
      resetPasswordToken: null as string | null,
      resetPasswordExpires: null as Date | null,
      isBlocked: false,
    };

    const user = await this.userRepository.create(userToCreate);

    const token = this.jwtService.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const { password: _, ...userWithoutPassword } = user;

    await this.emailService.sendVerificationEmail(user.email, emailVerificationToken);

    return { user: userWithoutPassword, token };
  }
}
