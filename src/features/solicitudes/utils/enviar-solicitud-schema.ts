import { z } from 'zod';
import { LIMITES, textoRequerido, uuidValido } from '../../../shared/validation';

export const enviarSolicitudSchema = z.object({
  destinatario: uuidValido(),
  mensajeSolicitud: textoRequerido(LIMITES.MENSAJE_SOLICITUD_MAX),
});

export type EnviarSolicitudValues = z.infer<typeof enviarSolicitudSchema>;

export function esCampoDelFormulario(campo: string): campo is keyof EnviarSolicitudValues {
  return campo === 'destinatario' || campo === 'mensajeSolicitud';
}
