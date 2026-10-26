import { z } from 'zod';

// Los mensajes por defecto de Zod (tipos incorrectos, campos faltantes, etc.) en español.
z.config(z.locales.es());

// Margen de un día para no rechazar el "hoy" de quien está en otra zona horaria.
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/** Texto obligatorio (label en minúscula, p. ej. "nombre de la comida"): se recortan los espacios, así que "   " cuenta como vacío. */
export const requiredText = (label: string, max: number) =>
  z
    .string({ message: `El campo ${label} es obligatorio` })
    .trim()
    .min(1, `El campo ${label} es obligatorio`)
    .max(max, `El campo ${label} no puede superar los ${max} caracteres`);

/** Número dentro de un rango, con mensajes en español. */
export const numberInRange = (label: string, min: number, max: number, { integer = false } = {}) => {
  const base = z.number({ message: `El campo ${label} debe ser un número` });
  return (integer ? base.int(`El campo ${label} debe ser un número entero`) : base)
    .min(min, `El campo ${label} debe ser mayor o igual a ${min}`)
    .max(max, `El campo ${label} debe ser menor o igual a ${max}`);
};

/** Número estrictamente mayor que cero y con tope. */
export const positiveNumber = (label: string, max: number, { integer = false } = {}) => {
  const base = z.number({ message: `El campo ${label} debe ser un número` });
  return (integer ? base.int(`El campo ${label} debe ser un número entero`) : base)
    .positive(`El campo ${label} debe ser mayor que 0`)
    .max(max, `El campo ${label} debe ser menor o igual a ${max}`);
};

/** Fecha que no puede estar en el futuro. */
export const pastOrTodayDate = (label = 'fecha') =>
  z.coerce
    .date({ message: `El campo ${label} no es válido` })
    .refine((date) => date.getTime() <= Date.now() + ONE_DAY_MS, `El campo ${label} no puede estar en el futuro`);

export const notes = z.string().max(1000, 'Las notas no pueden superar los 1000 caracteres').optional().nullable();

export const AT_LEAST_ONE_FIELD = 'Debes enviar al menos un campo para actualizar';
