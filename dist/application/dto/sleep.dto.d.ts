import { z } from 'zod';
export declare const CreateSleepSchema: z.ZodObject<{
    body: z.ZodObject<{
        hoursSlept: z.ZodNumber;
        sleepQuality: z.ZodNumber;
        hadNightmares: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        stressLevel: z.ZodNumber;
        notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        date: z.ZodCoercedDate<unknown>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const UpdateSleepSchema: z.ZodObject<{
    body: z.ZodObject<{
        hoursSlept: z.ZodOptional<z.ZodNumber>;
        sleepQuality: z.ZodOptional<z.ZodNumber>;
        hadNightmares: z.ZodOptional<z.ZodBoolean>;
        stressLevel: z.ZodOptional<z.ZodNumber>;
        notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        date: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const QuerySleepSchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
        limit: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
        date: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreateSleepDTO = z.infer<typeof CreateSleepSchema>['body'];
export type UpdateSleepDTO = z.infer<typeof UpdateSleepSchema>['body'];
export type QuerySleepDTO = z.infer<typeof QuerySleepSchema>['query'];
