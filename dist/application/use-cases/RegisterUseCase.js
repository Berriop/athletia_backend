"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUseCase = void 0;
class RegisterUseCase {
    constructor(userRepository, bcryptService, jwtService) {
        this.userRepository = userRepository;
        this.bcryptService = bcryptService;
        this.jwtService = jwtService;
    }
    async execute(data) {
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
            role: 'USER',
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
exports.RegisterUseCase = RegisterUseCase;
