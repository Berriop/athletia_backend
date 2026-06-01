import { z } from 'zod';

export const CreateSleepSchema = z.object({
  body: z.object({
    hoursSlept: z.number().positive('Hours slept must be positive'),
    sleepQuality: z.number().int().min(1).max(10, 'Sleep quality must be between 1 and 10'),
    hadNightmares: z.boolean().optional().default(false),
    stressLevel: z.number().int().min(1).max(10, 'Stress level must be between 1 and 10'),
    notes: z.string().max(1000).optional().nullable(),
    date: z.coerce.date(),
  }),
});

export const UpdateSleepSchema = z.object({
  body: z
    .object({
      hoursSlept: z.number().positive().optional(),
      sleepQuality: z.number().int().min(1).max(10).optional(),
      hadNightmares: z.boolean().optional(),
      stressLevel: z.number().int().min(1).max(10).optional(),
      notes: z.string().max(1000).optional().nullable(),
      date: z.coerce.date().optional(),
    })
    .refine((obj) => Object.keys(obj).length > 0, 'At least one field is required'),
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
