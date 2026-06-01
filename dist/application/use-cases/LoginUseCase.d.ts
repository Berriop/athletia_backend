import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { BcryptService } from '../../infrastructure/security/BcryptService';
import { JwtService } from '../../infrastructure/security/JwtService';
import { LoginDTO } from '../dto/auth.dto';
export declare class LoginUseCase {
    private userRepository;
    private bcryptService;
    private jwtService;
    constructor(userRepository: IUserRepository, bcryptService: BcryptService, jwtService: JwtService);
    execute(data: LoginDTO): Promise<{
        user: {
            id: string;
            email: string;
            name: string | null;
            birthDate: Date | null;
            gender: string | null;
            heightCm: number | null;
            weightKg: number | null;
            experienceLevel: string | null;
            role: "USER" | "ADMIN";
            createdAt: Date;
            updatedAt: Date;
        };
        token: string;
    }>;
}
