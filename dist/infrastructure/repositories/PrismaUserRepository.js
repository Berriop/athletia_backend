"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUserRepository = void 0;
const prisma_1 = require("../database/prisma");
class PrismaUserRepository {
    async findByEmail(email) {
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user)
            return null;
        return user;
    }
    async findById(id) {
        const user = await prisma_1.prisma.user.findUnique({ where: { id } });
        if (!user)
            return null;
        return user;
    }
    async create(data) {
        const user = await prisma_1.prisma.user.create({
            data: {
                email: data.email,
                password: data.password,
                name: data.name,
                birthDate: data.birthDate,
                gender: data.gender,
                heightCm: data.heightCm,
                weightKg: data.weightKg,
                experienceLevel: data.experienceLevel,
                role: data.role,
            },
        });
        return user;
    }
    async update(id, data) {
        const user = await prisma_1.prisma.user.update({
            where: { id },
            data,
        });
        return user;
    }
}
exports.PrismaUserRepository = PrismaUserRepository;
