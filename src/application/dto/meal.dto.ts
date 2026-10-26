import { z } from 'zod';
import { AT_LEAST_ONE_FIELD, numberInRange, pastOrTodayDate, requiredText } from './common';

const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as const;

const mealFields = {
  name: requiredText('nombre de la comida', 255),
  calories: numberInRange('calorías', 0, 10000, { integer: true }),
  mealType: z.enum(MEAL_TYPES, {
    message: 'El tipo de comida debe ser desayuno, almuerzo, cena o snack',
  }),
  proteinG: numberInRange('proteína', 0, 1000),
  carbsG: numberInRange('carbohidratos', 0, 1000),
  fatG: numberInRange('grasa', 0, 1000),
  date: pastOrTodayDate(),
};

export const CreateMealSchema = z.object({
  body: z.object(mealFields),
});

export const UpdateMealSchema = z.object({
  body: z
    .object({
      name: mealFields.name.optional(),
      calories: mealFields.calories.optional(),
      mealType: mealFields.mealType.optional(),
      proteinG: mealFields.proteinG.optional(),
      carbsG: mealFields.carbsG.optional(),
      fatG: mealFields.fatG.optional(),
      date: mealFields.date.optional(),
    })
    .refine((obj) => Object.keys(obj).length > 0, AT_LEAST_ONE_FIELD),
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
