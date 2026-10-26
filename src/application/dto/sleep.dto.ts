import { z } from 'zod';
import { AT_LEAST_ONE_FIELD, notes, numberInRange, pastOrTodayDate, positiveNumber } from './common';

const sleepFields = {
  hoursSlept: positiveNumber('horas de sueño', 24),
  sleepQuality: numberInRange('calidad del sueño', 1, 10, { integer: true }),
  hadNightmares: z.boolean().optional().default(false),
  stressLevel: numberInRange('nivel de estrés', 1, 10, { integer: true }),
  notes,
  date: pastOrTodayDate(),
};

export const CreateSleepSchema = z.object({
  body: z.object(sleepFields),
});

export const UpdateSleepSchema = z.object({
  body: z
    .object({
      hoursSlept: sleepFields.hoursSlept.optional(),
      sleepQuality: sleepFields.sleepQuality.optional(),
      hadNightmares: z.boolean().optional(),
      stressLevel: sleepFields.stressLevel.optional(),
      notes,
      date: sleepFields.date.optional(),
    })
    .refine((obj) => Object.keys(obj).length > 0, AT_LEAST_ONE_FIELD),
});

export const QuerySleepSchema = z.object({
  query: z.object({
    page: z.coerce.number().positive().optional().default(1),
    limit: z.coerce.number().positive().optional().default(10),
    date: z.string().optional(),
  }),
});

export type CreateSleepDTO = z.infer<typeof CreateSleepSchema>['body'];
export type UpdateSleepDTO = z.infer<typeof UpdateSleepSchema>['body'];
export type QuerySleepDTO = z.infer<typeof QuerySleepSchema>['query'];
