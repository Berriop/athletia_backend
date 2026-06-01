"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryMealSchema = exports.UpdateMealSchema = exports.CreateMealSchema = void 0;
const zod_1 = require("zod");
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
exports.CreateMealSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Name is required').max(255),
        calories: zod_1.z.number().int().nonnegative('Calories must be a non-negative integer'),
        mealType: zod_1.z.enum(MEAL_TYPES, {
            error: 'mealType must be breakfast, lunch, dinner or snack',
        }),
        proteinG: zod_1.z.number().nonnegative('Protein must be non-negative'),
        carbsG: zod_1.z.number().nonnegative('Carbs must be non-negative'),
        fatG: zod_1.z.number().nonnegative('Fat must be non-negative'),
        date: zod_1.z.coerce.date(),
    }),
});
exports.UpdateMealSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        name: zod_1.z.string().min(1).max(255).optional(),
        calories: zod_1.z.number().int().nonnegative().optional(),
        mealType: zod_1.z.enum(MEAL_TYPES).optional(),
        proteinG: zod_1.z.number().nonnegative().optional(),
        carbsG: zod_1.z.number().nonnegative().optional(),
        fatG: zod_1.z.number().nonnegative().optional(),
        date: zod_1.z.coerce.date().optional(),
    })
        .refine((obj) => Object.keys(obj).length > 0, 'At least one field is required'),
});
exports.QueryMealSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().positive().optional().default(1),
        limit: zod_1.z.coerce.number().positive().optional().default(10),
        mealType: zod_1.z.enum(MEAL_TYPES).optional(),
        date: zod_1.z.string().optional(),
    }),
});
