import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IHashService } from '../../domain/services/IHashService';
import { IJwtService } from '../../domain/services/IJwtService';
import { LoginDTO } from '../dto/auth.dto';
export declare class LoginUseCase {
    private userRepository;
    private hashService;
    private jwtService;
    constructor(userRepository: IUserRepository, hashService: IHashService, jwtService: IJwtService);
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
