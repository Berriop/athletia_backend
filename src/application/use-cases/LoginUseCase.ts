import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { BcryptService } from '../../infrastructure/security/BcryptService';
import { JwtService } from '../../infrastructure/security/JwtService';
import { LoginDTO } from '../dto/auth.dto';

export class LoginUseCase {
  constructor(
    private userRepository: IUserRepository,
    private bcryptService: BcryptService,
    private jwtService: JwtService
  ) {}

  async execute(data: LoginDTO) {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.password) {
       throw new Error('Invalid credentials');
    }

    const isMatch = await this.bcryptService.compare(data.password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
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
