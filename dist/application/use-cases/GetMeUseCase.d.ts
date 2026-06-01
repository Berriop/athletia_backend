import { IUserRepository } from '../../domain/repositories/IUserRepository';
export declare class GetMeUseCase {
    private userRepository;
    constructor(userRepository: IUserRepository);
    execute(userId: string): Promise<{
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
    }>;
}
