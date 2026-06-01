"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaInjuryRepository = void 0;
const prisma_1 = require("../database/prisma");
class PrismaInjuryRepository {
    async create(data) {
        return prisma_1.prisma.injury.create({ data });
    }
    async findById(id, userId) {
        return prisma_1.prisma.injury.findFirst({ where: { id, userId } });
    }
    async findAll(userId, skip, take, filters) {
        const where = this.buildWhereClause(userId, filters);
        return prisma_1.prisma.injury.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } });
    }
    async update(id, userId, data) {
        await prisma_1.prisma.injury.updateMany({ where: { id, userId }, data });
        return this.findById(id, userId);
    }
    async delete(id, userId) {
        const result = await prisma_1.prisma.injury.deleteMany({ where: { id, userId } });
        return result.count > 0;
    }
    async count(userId, filters) {
        const where = this.buildWhereClause(userId, filters);
        return prisma_1.prisma.injury.count({ where });
    }
    buildWhereClause(userId, filters) {
        const where = { userId };
        if (filters?.isActive !== undefined) {
            where.isActive = filters.isActive;
        }
        if (filters?.bodyArea) {
            where.bodyArea = { contains: filters.bodyArea, mode: 'insensitive' };
        }
        return where;
    }
}
exports.PrismaInjuryRepository = PrismaInjuryRepository;
