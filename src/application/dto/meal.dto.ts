import { z } from 'zod';

const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as const;

export const CreateMealSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(255),
    calories: z.number().int().nonnegative('Calories must be a non-negative integer'),
    mealType: z.enum(MEAL_TYPES, {
      message: 'mealType must be BREAKFAST, LUNCH, DINNER or SNACK',
    }),
    proteinG: z.number().nonnegative('Protein must be non-negative'),
    carbsG: z.number().nonnegative('Carbs must be non-negative'),
    fatG: z.number().nonnegative('Fat must be non-negative'),
    date: z.coerce.date(),
  }),
});

export const UpdateMealSchema = z.object({
  body: z
    .object({
      name: z.string().min(1).max(255).optional(),
      calories: z.number().int().nonnegative().optional(),
      mealType: z.enum(MEAL_TYPES).optional(),
      proteinG: z.number().nonnegative().optional(),
      carbsG: z.number().nonnegative().optional(),
      fatG: z.number().nonnegative().optional(),
      date: z.coerce.date().optional(),
    })
    .refine((obj) => Object.keys(obj).length > 0, 'At least one field is required'),
});

export const QueryMealSchema = z.object({
  query: z.object({
    page: z.coerce.number().positive().optional().default(1),
    limit: z.coerce.number().positive().optional().default(10),
    mealType: z.enum(MEAL_TYPES).optional(),
    date: z.string().optional(),
  }),
});

export type CreateMealDTO = z.infer<typeof CreateMealSchema>['body'];
export type UpdateMealDTO = z.infer<typeof UpdateMealSchema>['body'];
export type QueryMealDTO = z.infer<typeof QueryMealSchema>['query'];
