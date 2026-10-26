import { z } from 'zod';
import { AT_LEAST_ONE_FIELD, notes, numberInRange } from './common';

// Solo letras (incluye tildes y ñ) y espacios — sin números ni símbolos.
// "Rodilla derecha" pasa, "Rodilla2" o "Rodilla!" no.
const LETTERS_ONLY_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

const bodyAreaField = z
  .string()
  .trim()
  .min(1, 'El área del cuerpo es obligatoria')
  .max(250, 'El área del cuerpo no puede superar los 250 caracteres')
  .regex(LETTERS_ONLY_REGEX, 'El área del cuerpo solo puede contener letras y espacios');

const injuryNameField = z
  .string()
  .trim()
  .min(1, 'El nombre de la lesión es obligatorio')
  .max(250, 'El nombre de la lesión no puede superar los 250 caracteres')
  .regex(LETTERS_ONLY_REGEX, 'El nombre de la lesión solo puede contener letras y espacios');

export const CreateInjurySchema = z.object({
  body: z.object({
    bodyArea: bodyAreaField,
    injuryName: injuryNameField,
    severity: numberInRange('severidad', 1, 10, { integer: true }),
    isActive: z.boolean().optional().default(true),
    notes,
  }),
});

export const UpdateInjurySchema = z.object({
  body: z
    .object({
      bodyArea: bodyAreaField.optional(),
      injuryName: injuryNameField.optional(),
      severity: numberInRange('severidad', 1, 10, { integer: true }).optional(),
      isActive: z.boolean().optional(),
      notes,
    })
    .refine((obj) => Object.keys(obj).length > 0, AT_LEAST_ONE_FIELD),
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
