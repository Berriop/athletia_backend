import { z } from 'zod';
export declare const CreateWorkoutSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        bodyPart: z.ZodString;
        durationMinutes: z.ZodNumber;
        energyLevel: z.ZodNumber;
        fatigueLevel: z.ZodNumber;
        painLevel: z.ZodNumber;
        date: z.ZodCoercedDate<unknown>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const UpdateWorkoutSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        bodyPart: z.ZodOptional<z.ZodString>;
        durationMinutes: z.ZodOptional<z.ZodNumber>;
        energyLevel: z.ZodOptional<z.ZodNumber>;
        fatigueLevel: z.ZodOptional<z.ZodNumber>;
        painLevel: z.ZodOptional<z.ZodNumber>;
        date: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const QueryWorkoutSchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
        limit: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
        bodyPart: z.ZodOptional<z.ZodString>;
        date: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreateWorkoutDTO = z.infer<typeof CreateWorkoutSchema>['body'];
export type UpdateWorkoutDTO = z.infer<typeof UpdateWorkoutSchema>['body'];
export type QueryWorkoutDTO = z.infer<typeof QueryWorkoutSchema>['query'];
