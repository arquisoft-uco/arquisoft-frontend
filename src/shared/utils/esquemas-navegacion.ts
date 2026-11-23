import { z } from 'zod';

const LONGITUD_MAXIMA_SEARCH = 500;

export const esquemaSearch = z
  .string()
  .max(LONGITUD_MAXIMA_SEARCH)
  .refine((valor) => valor === '' || valor.startsWith('?'));

export const esquemaOrigen = z.object({
  etiqueta: z.string().min(1).max(200),
  to: z.string().refine((valor) => valor.startsWith('/') && !valor.startsWith('//')),
});
