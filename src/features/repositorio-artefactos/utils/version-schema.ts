import { z } from 'zod';
import { LIMITES, archivoPermitido, textoRequerido } from '../../../shared/validation';
import { EXTENSIONES_VERSION } from './tipos-archivo-version';

export const versionSchema = z.object({
  modo: z.enum(['nuevo', 'existente']),
  nombreDocumento: textoRequerido(LIMITES.VERSION_NOMBRE_DOCUMENTO_MAX),
  archivo: archivoPermitido({
    extensiones: EXTENSIONES_VERSION,
    tamanoMaxBytes: LIMITES.VERSION_ARCHIVO_TAMANO_MAX_BYTES,
    nombreMax: LIMITES.VERSION_NOMBRE_ARCHIVO_MAX,
  }),
});

export type VersionValues = z.infer<typeof versionSchema>;

export const ETIQUETAS_CAMPO_VERSION: Record<'nombreDocumento' | 'archivo', string> = {
  nombreDocumento: 'Documento',
  archivo: 'Archivo',
};

export const CAMPOS_VERSION = Object.keys(
  ETIQUETAS_CAMPO_VERSION,
) as (keyof typeof ETIQUETAS_CAMPO_VERSION)[];
