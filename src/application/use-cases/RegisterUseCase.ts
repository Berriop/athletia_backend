import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { BcryptService } from '../../infrastructure/security/BcryptService';
import { JwtService } from '../../infrastructure/security/JwtService';
import { RegisterDTO } from '../dto/auth.dto';

export class RegisterUseCase {
  constructor(
    private userRepository: IUserRepository,
    private bcryptService: BcryptService,
    private jwtService: JwtService
  ) {}

  async execute(data: RegisterDTO) {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email already in use');
    }

    const hashedPassword = await this.bcryptService.hash(data.password);

    const userToCreate = {
      ...data,
      password: hashedPassword,
      name: data.name ?? null,
      birthDate: data.birthDate ?? null,
      gender: data.gender ?? null,
      heightCm: data.heightCm ?? null,
      weightKg: data.weightKg ?? null,
      experienceLevel: data.experienceLevel ?? null,
      role: 'USER' as const,
    };

    const user = await this.userRepository.create(userToCreate);

    const token = this.jwtService.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }
}
