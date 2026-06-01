"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMeUseCase = void 0;
class GetMeUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const { password: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword };
    }
}
exports.GetMeUseCase = GetMeUseCase;
