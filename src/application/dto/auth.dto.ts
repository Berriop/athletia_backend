import { z } from 'zod';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{12,}$/;
const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;
const EXPERIENCE_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as const;

export const RegisterSchema = z.object({
  body: z
    .object({
      email: z.string().email('Invalid email format'),
      password: z
        .string()
        .min(12, 'La contraseña debe tener al menos 12 caracteres')
        .regex(
          passwordRegex,
          'La contraseña debe incluir al menos una letra mayúscula, una letra minúscula, un número y un carácter especial',
        ),
      confirmPassword: z.string().min(1, 'La confirmación de contraseña es requerida'),
      name: z.string().optional(),
      birthDate: z.coerce.date().optional(),
      gender: z.enum(GENDERS).optional(),
      heightCm: z.number().positive().optional(),
      weightKg: z.number().positive().optional(),
      experienceLevel: z.enum(EXPERIENCE_LEVELS).optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Las contraseñas no coinciden',
      path: ['confirmPassword'],
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
