"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryWorkoutSchema = exports.UpdateWorkoutSchema = exports.CreateWorkoutSchema = void 0;
const zod_1 = require("zod");
exports.CreateWorkoutSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, 'Title is required').max(255),
        description: zod_1.z.string().max(1000).nullable().optional(),
        bodyPart: zod_1.z.string().min(1, 'Body part is required'),
        durationMinutes: zod_1.z.number().positive(),
        energyLevel: zod_1.z.number().min(1).max(10),
        fatigueLevel: zod_1.z.number().min(1).max(10),
        painLevel: zod_1.z.number().min(1).max(10),
        date: zod_1.z.coerce.date(),
    }),
});
exports.UpdateWorkoutSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1).max(255).optional(),
        description: zod_1.z.string().max(1000).optional().nullable(),
        bodyPart: zod_1.z.string().min(1).optional(),
        durationMinutes: zod_1.z.number().positive().optional(),
        energyLevel: zod_1.z.number().min(1).max(10).optional(),
        fatigueLevel: zod_1.z.number().min(1).max(10).optional(),
        painLevel: zod_1.z.number().min(1).max(10).optional(),
        date: zod_1.z.coerce.date().optional(),
    }).refine(obj => Object.keys(obj).length > 0, 'At least one field required'),
});
exports.QueryWorkoutSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().positive().optional().default(1),
        limit: zod_1.z.coerce.number().positive().optional().default(10),
        bodyPart: zod_1.z.string().optional(),
        date: zod_1.z.string().optional(),
    }),
});
