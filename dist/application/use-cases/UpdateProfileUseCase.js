"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfileUseCase = void 0;
class UpdateProfileUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(userId, data) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        // Prisma expects a Date object, not a string
        const payload = { ...data };
        if (data.birthDate) {
            payload.birthDate = new Date(data.birthDate);
        }
        else if (data.birthDate === null || data.birthDate === '') {
            payload.birthDate = null;
        }
        const updated = await this.userRepository.update(userId, payload);
        const { password: _, ...userWithoutPassword } = updated;
        return { user: userWithoutPassword };
    }
}
exports.UpdateProfileUseCase = UpdateProfileUseCase;
