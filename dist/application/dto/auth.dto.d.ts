import { z } from 'zod';
export declare const RegisterSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        birthDate: z.ZodOptional<z.ZodCoercedDate<unknown>>;
        gender: z.ZodOptional<z.ZodString>;
        heightCm: z.ZodOptional<z.ZodNumber>;
        weightKg: z.ZodOptional<z.ZodNumber>;
        experienceLevel: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const LoginSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type RegisterDTO = z.infer<typeof RegisterSchema>['body'];
export type LoginDTO = z.infer<typeof LoginSchema>['body'];
