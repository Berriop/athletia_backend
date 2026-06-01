import { z } from 'zod';

export const RegisterSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    name: z.string().optional(),
    birthDate: z.coerce.date().optional(),
    gender: z.string().optional(),
    heightCm: z.number().positive().optional(),
    weightKg: z.number().positive().optional(),
    experienceLevel: z.string().optional(),
  }),
});

export const LoginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export type RegisterDTO = z.infer<typeof RegisterSchema>['body'];
export type LoginDTO = z.infer<typeof LoginSchema>['body'];
