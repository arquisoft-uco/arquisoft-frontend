import { hasApiErrorCode } from '../../../shared/utils/api-error';
import { ARTEFACTO_NO_ENCONTRADO, ARTEFACTO_OMITIDO } from './errores-omitir-artefacto';

export const ESTUDIANTE_NO_VINCULADO_ARTEFACTO =
  'ESTUDIANTE_ARTEFACTO_ESTUDIANTE_NO_VINCULADO_ARTEFACTO';
export const ARTEFACTO_NO_PROPIETARIO = 'ARTEFACTOS_ARTEFACTO_ASESOR_NO_PROPIETARIO';

export function artefactoYaNoDisponible(err: unknown): boolean {
  return (
    hasApiErrorCode(err, ARTEFACTO_NO_ENCONTRADO) ||
    hasApiErrorCode(err, ARTEFACTO_OMITIDO) ||
    hasApiErrorCode(err, ARTEFACTO_NO_PROPIETARIO)
  );
}
