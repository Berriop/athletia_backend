"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaMealRepository = void 0;
const prisma_1 = require("../database/prisma");
class PrismaMealRepository {
    async create(data) {
        return prisma_1.prisma.meal.create({ data });
    }
    async findById(id, userId) {
        return prisma_1.prisma.meal.findFirst({ where: { id, userId } });
    }
    async findAll(userId, skip, take, filters) {
        const where = this.buildWhereClause(userId, filters);
        return prisma_1.prisma.meal.findMany({ where, skip, take, orderBy: { date: 'desc' } });
    }
    async update(id, userId, data) {
        await prisma_1.prisma.meal.updateMany({ where: { id, userId }, data });
        return this.findById(id, userId);
    }
    async delete(id, userId) {
        const result = await prisma_1.prisma.meal.deleteMany({ where: { id, userId } });
        return result.count > 0;
    }
    async count(userId, filters) {
        const where = this.buildWhereClause(userId, filters);
        return prisma_1.prisma.meal.count({ where });
    }
    // Extracted to avoid duplication between findAll and count
    buildWhereClause(userId, filters) {
        const where = { userId };
        if (filters?.mealType) {
            where.mealType = filters.mealType;
        }
        if (filters?.date) {
            const startOfDay = new Date(filters.date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(filters.date);
            endOfDay.setHours(23, 59, 59, 999);
            where.date = { gte: startOfDay, lte: endOfDay };
        }
        return where;
    }
}
exports.PrismaMealRepository = PrismaMealRepository;
