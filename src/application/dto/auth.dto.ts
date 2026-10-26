import { z } from 'zod';
import { numberInRange } from './common';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{12,}$/;
const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;
const EXPERIENCE_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as const;

const GENDER_MESSAGE = 'El género debe ser masculino, femenino u otro';
const EXPERIENCE_MESSAGE = 'El nivel de experiencia debe ser principiante, intermedio, avanzado o experto';
const BIRTH_DATE_MESSAGE = 'La fecha de nacimiento debe estar entre 1900 y hoy';

const heightField = numberInRange('altura', 50, 300);
const weightField = numberInRange('peso', 20, 300);

function isValidBirthDate(date: Date): boolean {
  return date.getUTCFullYear() >= 1900 && date.getTime() <= Date.now();
}

// '' o null borran el valor; el texto se pasa a mayúsculas porque así está el enum de Prisma.
const optionalEnum = <T extends readonly [string, ...string[]]>(values: T, message: string) =>
  z
    .preprocess(
      (value) => (typeof value === 'string' ? value.trim().toUpperCase() || null : value),
      z.enum(values, { message }).nullable(),
    )
    .optional();

export const RegisterSchema = z.object({
  body: z
    .object({
      email: z.email('El formato del correo no es válido'),
      password: z
        .string()
        .min(12, 'La contraseña debe tener al menos 12 caracteres')
        .regex(
          passwordRegex,
          'La contraseña debe incluir al menos una letra mayúscula, una letra minúscula, un número y un carácter especial',
        ),
      confirmPassword: z.string().min(1, 'La confirmación de contraseña es requerida'),
      name: z.string().trim().max(100, 'El nombre no puede superar los 100 caracteres').optional(),
      birthDate: z.coerce.date().refine(isValidBirthDate, BIRTH_DATE_MESSAGE).optional(),
      gender: z.enum(GENDERS, { message: GENDER_MESSAGE }).optional(),
      heightCm: heightField.optional(),
      weightKg: weightField.optional(),
      experienceLevel: z.enum(EXPERIENCE_LEVELS, { message: EXPERIENCE_MESSAGE }).optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Las contraseñas no coinciden',
      path: ['confirmPassword'],
    }),
});

export const LoginSchema = z.object({
  body: z.object({
    email: z.email('El formato del correo no es válido'),
    password: z.string().min(1, 'La contraseña es obligatoria'),
  }),
});

export const ForgotPasswordSchema = z.object({
  body: z.object({
    email: z.email('El formato del correo no es válido'),
  }),
});

export const ResetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'El token es obligatorio'),
    newPassword: z
      .string()
      .min(12, 'La contraseña debe tener al menos 12 caracteres')
      .regex(
        passwordRegex,
        'La contraseña debe incluir al menos una letra mayúscula, una letra minúscula, un número y un carácter especial',
      ),
  }),
});

// Solo se aceptan estos campos: cualquier otro (role, isBlocked, password, email...) se descarta.
export const UpdateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .max(100, 'El nombre no puede superar los 100 caracteres')
      .transform((value) => value || null)
      .nullable()
      .optional(),
    gender: optionalEnum(GENDERS, GENDER_MESSAGE),
    birthDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha de nacimiento no es válida')
      .refine((value) => isValidBirthDate(new Date(value)), BIRTH_DATE_MESSAGE)
      .or(z.literal(''))
      .nullable()
      .optional(),
    heightCm: heightField.nullable().optional(),
    weightKg: weightField.nullable().optional(),
    experienceLevel: optionalEnum(EXPERIENCE_LEVELS, EXPERIENCE_MESSAGE),
  }),
});

export type RegisterDTO = z.infer<typeof RegisterSchema>['body'];
export type LoginDTO = z.infer<typeof LoginSchema>['body'];
export type ForgotPasswordDTO = z.infer<typeof ForgotPasswordSchema>['body'];
export type ResetPasswordDTO = z.infer<typeof ResetPasswordSchema>['body'];
