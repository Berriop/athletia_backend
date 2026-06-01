"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUseCase = void 0;
class LoginUseCase {
    constructor(userRepository, bcryptService, jwtService) {
        this.userRepository = userRepository;
        this.bcryptService = bcryptService;
        this.jwtService = jwtService;
    }
    async execute(data) {
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
exports.LoginUseCase = LoginUseCase;
