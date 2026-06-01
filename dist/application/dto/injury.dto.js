"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryInjurySchema = exports.UpdateInjurySchema = exports.CreateInjurySchema = void 0;
const zod_1 = require("zod");
exports.CreateInjurySchema = zod_1.z.object({
    body: zod_1.z.object({
        bodyArea: zod_1.z.string().min(1, 'Body area is required').max(255),
        injuryName: zod_1.z.string().min(1, 'Injury name is required').max(255),
        severity: zod_1.z.number().int().min(1).max(10, 'Severity must be between 1 and 10'),
        isActive: zod_1.z.boolean().optional().default(true),
        notes: zod_1.z.string().max(1000).optional().nullable(),
    }),
});
exports.UpdateInjurySchema = zod_1.z.object({
    body: zod_1.z
        .object({
        bodyArea: zod_1.z.string().min(1).max(255).optional(),
        injuryName: zod_1.z.string().min(1).max(255).optional(),
        severity: zod_1.z.number().int().min(1).max(10).optional(),
        isActive: zod_1.z.boolean().optional(),
        notes: zod_1.z.string().max(1000).optional().nullable(),
    })
        .refine((obj) => Object.keys(obj).length > 0, 'At least one field is required'),
});
exports.QueryInjurySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().positive().optional().default(1),
        limit: zod_1.z.coerce.number().positive().optional().default(10),
        isActive: zod_1.z
            .string()
            .transform((val) => val === 'true')
            .optional(),
        bodyArea: zod_1.z.string().optional(),
    }),
});
