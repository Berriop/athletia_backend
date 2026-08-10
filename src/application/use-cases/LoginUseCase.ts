import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IHashService } from '../../domain/services/IHashService';
import { IJwtService } from '../../domain/services/IJwtService';
import { LoginDTO } from '../dto/auth.dto';
import { UnauthorizedError, ForbiddenError } from '../../domain/errors/AppError';

export class LoginUseCase {
  constructor(
    private userRepository: IUserRepository,
    private hashService: IHashService,
    private jwtService: IJwtService
  ) {}

  async execute(data: LoginDTO) {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (user.isBlocked) {
      throw new ForbiddenError('Tu cuenta se encuentra bloqueada. Contacta al administrador.');
    }

    if (!user.password) {
       throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await this.hashService.compare(data.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = this.jwtService.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }
}

