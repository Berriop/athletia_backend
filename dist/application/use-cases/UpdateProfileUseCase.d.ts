import { IUserRepository } from '../../domain/repositories/IUserRepository';
export interface UpdateProfileDTO {
    name?: string | null;
    gender?: string | null;
    birthDate?: string | null;
    heightCm?: number | null;
    weightKg?: number | null;
    experienceLevel?: string | null;
}
export declare class UpdateProfileUseCase {
    private userRepository;
    constructor(userRepository: IUserRepository);
    execute(userId: string, data: UpdateProfileDTO): Promise<{
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
