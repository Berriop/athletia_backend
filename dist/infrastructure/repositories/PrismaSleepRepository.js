"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaSleepRepository = void 0;
const prisma_1 = require("../database/prisma");
class PrismaSleepRepository {
    async create(data) {
        return prisma_1.prisma.sleepLog.create({ data });
    }
    async findById(id, userId) {
        return prisma_1.prisma.sleepLog.findFirst({ where: { id, userId } });
    }
    async findAll(userId, skip, take, filters) {
        const where = this.buildWhereClause(userId, filters);
        return prisma_1.prisma.sleepLog.findMany({ where, skip, take, orderBy: { date: 'desc' } });
    }
    async update(id, userId, data) {
        await prisma_1.prisma.sleepLog.updateMany({ where: { id, userId }, data });
        return this.findById(id, userId);
    }
    async delete(id, userId) {
        const result = await prisma_1.prisma.sleepLog.deleteMany({ where: { id, userId } });
        return result.count > 0;
    }
    async count(userId, filters) {
        const where = this.buildWhereClause(userId, filters);
        return prisma_1.prisma.sleepLog.count({ where });
    }
    buildWhereClause(userId, filters) {
        const where = { userId };
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
exports.PrismaSleepRepository = PrismaSleepRepository;
