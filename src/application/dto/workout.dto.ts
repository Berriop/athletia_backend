import { z } from 'zod';

export const CreateWorkoutSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(255),
    description: z.string().max(1000).nullable().optional(),
    bodyPart: z.string().min(1, 'Body part is required'),
    durationMinutes: z.number().positive(),
    energyLevel: z.number().min(1).max(10),
    fatigueLevel: z.number().min(1).max(10),
    painLevel: z.number().min(1).max(10),
    date: z.coerce.date(),
  }),
});

export const UpdateWorkoutSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional().nullable(),
    bodyPart: z.string().min(1).optional(),
    durationMinutes: z.number().positive().optional(),
    energyLevel: z.number().min(1).max(10).optional(),
    fatigueLevel: z.number().min(1).max(10).optional(),
    painLevel: z.number().min(1).max(10).optional(),
    date: z.coerce.date().optional(),
  }).refine(obj => Object.keys(obj).length > 0, 'At least one field required'),
});

export const QueryWorkoutSchema = z.object({
  query: z.object({
    page: z.coerce.number().positive().optional().default(1),
    limit: z.coerce.number().positive().optional().default(10),
    bodyPart: z.string().optional(),
    date: z.string().optional(),
  }),
});

export type CreateWorkoutDTO = z.infer<typeof CreateWorkoutSchema>['body'];
export type UpdateWorkoutDTO = z.infer<typeof UpdateWorkoutSchema>['body'];
export type QueryWorkoutDTO = z.infer<typeof QueryWorkoutSchema>['query'];
