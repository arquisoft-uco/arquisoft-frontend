import type { UseFormSetError } from 'react-hook-form';
import { getApiFieldErrors, hasApiErrorCode } from '../../../shared/utils/api-error';
import { CAMPOS, type RepositorioValues } from './repositorio-schema';

const MENSAJE_DUPLICADO = 'Ya existe un repositorio con este nombre.';

export function aplicarErrorDeRepositorio(
  err: unknown,
  setError: UseFormSetError<RepositorioValues>,
) {
  if (hasApiErrorCode(err, 'REPOSITORIO_ARTEFACTO_DUPLICADO')) {
    setError('nombreRepositorio', { message: MENSAJE_DUPLICADO }, { shouldFocus: true });
  }
  for (const { field, message } of getApiFieldErrors(err)) {
    const campo = CAMPOS.find((c) => c === field);
    if (campo) setError(campo, { message });
  }
}
