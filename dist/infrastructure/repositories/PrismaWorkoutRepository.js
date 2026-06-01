"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaWorkoutRepository = void 0;
const prisma_1 = require("../database/prisma");
class PrismaWorkoutRepository {
    async create(data) {
        return prisma_1.prisma.workout.create({ data });
    }
    async findById(id, userId) {
        return prisma_1.prisma.workout.findFirst({ where: { id, userId } });
    }
    async findAll(userId, skip, take, filters) {
        const where = { userId };
        if (filters?.bodyPart)
            where.bodyPart = { contains: filters.bodyPart, mode: 'insensitive' };
        if (filters?.date) {
            const startOfDay = new Date(filters.date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(filters.date);
            endOfDay.setHours(23, 59, 59, 999);
            where.date = { gte: startOfDay, lte: endOfDay };
        }
        return prisma_1.prisma.workout.findMany({ where, skip, take, orderBy: { date: 'desc' } });
    }
    async update(id, userId, data) {
        return prisma_1.prisma.workout.updateMany({
            where: { id, userId },
            data,
        }).then(() => this.findById(id, userId));
    }
    async delete(id, userId) {
        const result = await prisma_1.prisma.workout.deleteMany({ where: { id, userId } });
        return result.count > 0;
    }
    async count(userId, filters) {
        const where = { userId };
        if (filters?.bodyPart)
            where.bodyPart = { contains: filters.bodyPart, mode: 'insensitive' };
        if (filters?.date) {
            const startOfDay = new Date(filters.date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(filters.date);
            endOfDay.setHours(23, 59, 59, 999);
            where.date = { gte: startOfDay, lte: endOfDay };
        }
        return prisma_1.prisma.workout.count({ where });
    }
}
exports.PrismaWorkoutRepository = PrismaWorkoutRepository;
