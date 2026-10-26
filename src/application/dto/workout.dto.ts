import { z } from 'zod';
import { AT_LEAST_ONE_FIELD, numberInRange, pastOrTodayDate, positiveNumber, requiredText } from './common';

const BODY_PARTS = [
  'CHEST',
  'BACK',
  'SHOULDERS',
  'BICEPS',
  'TRICEPS',
  'LEGS',
  'CORE',
  'CARDIO',
  'FULL_BODY',
  'OTHER',
] as const;

const workoutFields = {
  title: requiredText('título', 255),
  description: z.string().max(1000, 'La descripción no puede superar los 1000 caracteres').nullable().optional(),
  bodyPart: z.enum(BODY_PARTS, {
    message: 'La parte del cuerpo no es válida',
  }),
  // Un día completo (24 h) como tope.
  durationMinutes: positiveNumber('duración', 1440, { integer: true }),
  energyLevel: numberInRange('nivel de energía', 1, 10, { integer: true }),
  fatigueLevel: numberInRange('nivel de fatiga', 1, 10, { integer: true }),
  painLevel: numberInRange('nivel de dolor', 1, 10, { integer: true }),
  date: pastOrTodayDate(),
};

export const CreateWorkoutSchema = z.object({
  body: z.object(workoutFields),
});

export const UpdateWorkoutSchema = z.object({
  body: z
    .object({
      title: workoutFields.title.optional(),
      description: workoutFields.description,
      bodyPart: workoutFields.bodyPart.optional(),
      durationMinutes: workoutFields.durationMinutes.optional(),
      energyLevel: workoutFields.energyLevel.optional(),
      fatigueLevel: workoutFields.fatigueLevel.optional(),
      painLevel: workoutFields.painLevel.optional(),
      date: workoutFields.date.optional(),
    })
    .refine((obj) => Object.keys(obj).length > 0, AT_LEAST_ONE_FIELD),
});

export const QueryWorkoutSchema = z.object({
  query: z.object({
    page: z.coerce.number().positive().optional().default(1),
    limit: z.coerce.number().positive().optional().default(10),
    bodyPart: z.enum(BODY_PARTS).optional(),
    date: z.string().optional(),
  }),
});

export type CreateWorkoutDTO = z.infer<typeof CreateWorkoutSchema>['body'];
export type UpdateWorkoutDTO = z.infer<typeof UpdateWorkoutSchema>['body'];
export type QueryWorkoutDTO = z.infer<typeof QueryWorkoutSchema>['query'];
