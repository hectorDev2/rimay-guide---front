import { z } from 'zod';

export const tourSchema = z.object({
  slug: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(60, 'Máximo 60 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
  nameQuechua: z.string().max(100).optional().or(z.literal('')),
  description: z.string().min(10, 'Mínimo 10 caracteres').max(500, 'Máximo 500 caracteres'),
  totalDurationMinutes: z
    .number({ invalid_type_error: 'Debe ser un número' })
    .int('Debe ser entero')
    .positive('Debe ser positivo')
    .max(600, 'Máximo 600 minutos'),
});

export type TourInput = z.infer<typeof tourSchema>;

export const stopSchema = z.object({
  order: z
    .number({ invalid_type_error: 'Debe ser un número' })
    .int('Debe ser entero')
    .positive('Debe ser positivo'),
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
  nameQuechua: z.string().max(100).optional().or(z.literal('')),
  description: z.string().min(10, 'Mínimo 10 caracteres').max(500, 'Máximo 500 caracteres'),
  culturalContext: z.string().min(10, 'Mínimo 10 caracteres').max(1500, 'Máximo 1500 caracteres'),
  latitude: z
    .number({ invalid_type_error: 'Debe ser un número' })
    .min(-90, 'Latitud inválida')
    .max(90, 'Latitud inválida'),
  longitude: z
    .number({ invalid_type_error: 'Debe ser un número' })
    .min(-180, 'Longitud inválida')
    .max(180, 'Longitud inválida'),
  radiusMeters: z
    .number({ invalid_type_error: 'Debe ser un número' })
    .int('Debe ser entero')
    .positive('Debe ser positivo')
    .max(500, 'Máximo 500 metros'),
  audioSrc: z.string().min(1, 'URL o path requerido'),
  durationSeconds: z
    .number({ invalid_type_error: 'Debe ser un número' })
    .int('Debe ser entero')
    .positive('Debe ser positivo')
    .max(3600, 'Máximo 3600 segundos'),
});

export type StopInput = z.infer<typeof stopSchema>;

export const translationSchema = z.object({
  namespace: z.string().min(1, 'Requerido').max(50, 'Máximo 50 caracteres'),
  key: z.string().min(1, 'Requerido').max(100, 'Máximo 100 caracteres'),
  lang: z.enum(['es', 'en'], { errorMap: () => ({ message: 'Debe ser "es" o "en"' }) }),
  value: z.string().min(1, 'Requerido').max(2000, 'Máximo 2000 caracteres'),
});

export type TranslationInput = z.infer<typeof translationSchema>;
