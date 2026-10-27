import { z } from 'zod';

export const nuevoCasoSchema = z
  .object({
    canal: z.enum(['Llamada', 'WhatsApp'], {
      required_error: 'Elige el canal',
      invalid_type_error: 'Elige el canal',
    }),
    cliente_id: z.string().min(1, 'Elige un cliente'),
    sede_id: z.string().min(1, 'Elige una sede'),
    contacto_id: z.string().min(1, 'Elige un contacto'),
    telefono: z.string().min(6, 'Ingresa un teléfono'),
    equipo_id: z.string().min(1, 'Elige un equipo'),
    tipo_servicio: z.string().min(1, 'Elige el tipo de servicio'),
    modalidad: z.string().min(1, 'Elige la modalidad'),
    modo_sugerido: z.string().optional(),
    modo_servicio: z.string().min(1, 'Elige el modo de servicio'),
    motivo_cambio_modo: z.string().optional(),
    incidencia: z
      .string()
      .refine((val) => val.trim().length >= 5, {
        message: 'Describe la incidencia',
      }),
  })
  .refine(
    (data) => {
      // Si el modo elegido es diferente al sugerido, el motivo es obligatorio
      if (data.modo_sugerido && data.modo_servicio !== data.modo_sugerido) {
        return !!data.motivo_cambio_modo && data.motivo_cambio_modo.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Explica por qué cambias el modo',
      path: ['motivo_cambio_modo'],
    }
  );

export type NuevoCasoFormValues = z.infer<typeof nuevoCasoSchema>;
