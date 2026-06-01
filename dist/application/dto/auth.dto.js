"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginSchema = exports.RegisterSchema = void 0;
const zod_1 = require("zod");
exports.RegisterSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email format'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
        name: zod_1.z.string().optional(),
        birthDate: zod_1.z.coerce.date().optional(),
        gender: zod_1.z.string().optional(),
        heightCm: zod_1.z.number().positive().optional(),
        weightKg: zod_1.z.number().positive().optional(),
        experienceLevel: zod_1.z.string().optional(),
    }),
});
exports.LoginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email format'),
        password: zod_1.z.string().min(1, 'Password is required'),
    }),
});
