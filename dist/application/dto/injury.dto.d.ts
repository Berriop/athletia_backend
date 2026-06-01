import { z } from 'zod';
export declare const CreateInjurySchema: z.ZodObject<{
    body: z.ZodObject<{
        bodyArea: z.ZodString;
        injuryName: z.ZodString;
        severity: z.ZodNumber;
        isActive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const UpdateInjurySchema: z.ZodObject<{
    body: z.ZodObject<{
        bodyArea: z.ZodOptional<z.ZodString>;
        injuryName: z.ZodOptional<z.ZodString>;
        severity: z.ZodOptional<z.ZodNumber>;
        isActive: z.ZodOptional<z.ZodBoolean>;
        notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const QueryInjurySchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
        limit: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
        isActive: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<boolean, string>>>;
        bodyArea: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreateInjuryDTO = z.infer<typeof CreateInjurySchema>['body'];
export type UpdateInjuryDTO = z.infer<typeof UpdateInjurySchema>['body'];
export type QueryInjuryDTO = z.infer<typeof QueryInjurySchema>['query'];
