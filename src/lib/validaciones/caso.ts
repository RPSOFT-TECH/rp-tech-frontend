import { z } from 'zod';

export const nuevoCasoSchema = z.object({
  canal_id: z.string().optional().default(''),
  cliente_id: z.string().min(1, 'Elige una empresa'),
  sede_id: z.string().min(1, 'Elige una dirección'),
  contacto_id: z.string().min(1, 'Elige un contacto'),
  telefono: z.string().min(6, 'Ingresa un teléfono'),
  equipo_id: z.string().min(1, 'Elige un equipo'),
  tipo_servicio_id: z.string().min(1, 'Elige el tipo de servicio'),
  modalidad_id: z.string().optional().default(''),
  modo_sugerido_id: z.string().optional(),
  modo_servicio_id: z.string().min(1, 'Elige el modo de servicio'),
  motivo_cambio_modo: z.string().optional(),
  incidencia: z.string().refine((val) => val.trim().length >= 5, {
    message: 'Describe la incidencia',
  }),
});

export type NuevoCasoFormValues = z.infer<typeof nuevoCasoSchema>;
