"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuerySleepSchema = exports.UpdateSleepSchema = exports.CreateSleepSchema = void 0;
const zod_1 = require("zod");
exports.CreateSleepSchema = zod_1.z.object({
    body: zod_1.z.object({
        hoursSlept: zod_1.z.number().positive('Hours slept must be positive'),
        sleepQuality: zod_1.z.number().int().min(1).max(10, 'Sleep quality must be between 1 and 10'),
        hadNightmares: zod_1.z.boolean().optional().default(false),
        stressLevel: zod_1.z.number().int().min(1).max(10, 'Stress level must be between 1 and 10'),
        notes: zod_1.z.string().max(1000).optional().nullable(),
        date: zod_1.z.coerce.date(),
    }),
});
exports.UpdateSleepSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        hoursSlept: zod_1.z.number().positive().optional(),
        sleepQuality: zod_1.z.number().int().min(1).max(10).optional(),
        hadNightmares: zod_1.z.boolean().optional(),
        stressLevel: zod_1.z.number().int().min(1).max(10).optional(),
        notes: zod_1.z.string().max(1000).optional().nullable(),
        date: zod_1.z.coerce.date().optional(),
    })
        .refine((obj) => Object.keys(obj).length > 0, 'At least one field is required'),
});
exports.QuerySleepSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().positive().optional().default(1),
        limit: zod_1.z.coerce.number().positive().optional().default(10),
        date: zod_1.z.string().optional(),
    }),
});
