import { z } from 'zod';
import { LIMITES, archivoPermitido } from '../../../shared/validation';
import { EXTENSIONES_VERSION_ARTEFACTO } from './tipos-archivo-version-artefacto';

export const versionArtefactoSchema = z.object({
  archivo: archivoPermitido({
    extensiones: EXTENSIONES_VERSION_ARTEFACTO,
    tamanoMaxBytes: LIMITES.VERSION_ARCHIVO_TAMANO_MAX_BYTES,
    nombreMax: LIMITES.VERSION_NOMBRE_ARCHIVO_MAX,
  }),
});

export type VersionArtefactoValues = z.infer<typeof versionArtefactoSchema>;

export const ETIQUETAS_CAMPO_VERSION_ARTEFACTO: Record<'archivo', string> = {
  archivo: 'Archivo',
};

export const CAMPOS_VERSION_ARTEFACTO = Object.keys(
  ETIQUETAS_CAMPO_VERSION_ARTEFACTO,
) as (keyof typeof ETIQUETAS_CAMPO_VERSION_ARTEFACTO)[];
