import { z } from 'zod';

export const CreateInjurySchema = z.object({
  body: z.object({
    bodyArea: z.string().min(1, 'Body area is required').max(255),
    injuryName: z.string().min(1, 'Injury name is required').max(255),
    severity: z.number().int().min(1).max(10, 'Severity must be between 1 and 10'),
    isActive: z.boolean().optional().default(true),
    notes: z.string().max(1000).optional().nullable(),
  }),
});

export const UpdateInjurySchema = z.object({
  body: z
    .object({
      bodyArea: z.string().min(1).max(255).optional(),
      injuryName: z.string().min(1).max(255).optional(),
      severity: z.number().int().min(1).max(10).optional(),
      isActive: z.boolean().optional(),
      notes: z.string().max(1000).optional().nullable(),
    })
    .refine((obj) => Object.keys(obj).length > 0, 'At least one field is required'),
});

export const QueryInjurySchema = z.object({
  query: z.object({
    page: z.coerce.number().positive().optional().default(1),
    limit: z.coerce.number().positive().optional().default(10),
    isActive: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
    bodyArea: z.string().optional(),
  }),
});

export type CreateInjuryDTO = z.infer<typeof CreateInjurySchema>['body'];
export type UpdateInjuryDTO = z.infer<typeof UpdateInjurySchema>['body'];
export type QueryInjuryDTO = z.infer<typeof QueryInjurySchema>['query'];
