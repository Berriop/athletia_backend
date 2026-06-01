import { z } from 'zod';
export declare const CreateMealSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        calories: z.ZodNumber;
        mealType: z.ZodEnum<{
            breakfast: "breakfast";
            lunch: "lunch";
            dinner: "dinner";
            snack: "snack";
        }>;
        proteinG: z.ZodNumber;
        carbsG: z.ZodNumber;
        fatG: z.ZodNumber;
        date: z.ZodCoercedDate<unknown>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const UpdateMealSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        calories: z.ZodOptional<z.ZodNumber>;
        mealType: z.ZodOptional<z.ZodEnum<{
            breakfast: "breakfast";
            lunch: "lunch";
            dinner: "dinner";
            snack: "snack";
        }>>;
        proteinG: z.ZodOptional<z.ZodNumber>;
        carbsG: z.ZodOptional<z.ZodNumber>;
        fatG: z.ZodOptional<z.ZodNumber>;
        date: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const QueryMealSchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
        limit: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
        mealType: z.ZodOptional<z.ZodEnum<{
            breakfast: "breakfast";
            lunch: "lunch";
            dinner: "dinner";
            snack: "snack";
        }>>;
        date: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreateMealDTO = z.infer<typeof CreateMealSchema>['body'];
export type UpdateMealDTO = z.infer<typeof UpdateMealSchema>['body'];
export type QueryMealDTO = z.infer<typeof QueryMealSchema>['query'];
