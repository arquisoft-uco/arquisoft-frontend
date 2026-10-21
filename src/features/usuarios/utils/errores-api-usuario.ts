import {
  getApiErrorMessage,
  getApiFieldErrors,
  hasApiErrorCode,
} from '../../../shared/utils/api-error';

const CODIGOS_DE_DUPLICADO: { codigo: string; campo: string; respaldo: string }[] = [
  {
    codigo: 'USUARIO_IDENTIFICADOR_DUPLICADO',
    campo: 'identificador',
    respaldo: 'Ya existe un usuario con este identificador.',
  },
  {
    codigo: 'USUARIO_EMAIL_DUPLICADO',
    campo: 'email',
    respaldo: 'Ya existe un usuario con este correo.',
  },
  {
    codigo: 'USUARIO_CONTACTO_DUPLICADO',
    campo: 'contacto',
    respaldo: 'Ya existe un usuario con este contacto.',
  },
];

export function aplicarErroresDeApi<Campo extends string>(
  err: unknown,
  setError: (campo: Campo, error: { message: string }, opciones?: { shouldFocus: boolean }) => void,
  campos: readonly Campo[],
  alias: Record<string, readonly Campo[]> = {},
): void {
  let enfocado = false;

  function pintar(destino: string, message: string) {
    const campo = campos.find((c) => c === destino);
    if (campo === undefined) return;
    setError(campo, { message }, enfocado ? undefined : { shouldFocus: true });
    enfocado = true;
  }

  for (const { codigo, campo, respaldo } of CODIGOS_DE_DUPLICADO) {
    if (hasApiErrorCode(err, codigo)) pintar(campo, getApiErrorMessage(err, respaldo));
  }

  for (const { field, message } of getApiFieldErrors(err)) {
    const destinos: readonly string[] = Object.prototype.hasOwnProperty.call(alias, field)
      ? alias[field]
      : [field];
    for (const destino of destinos) pintar(destino, message);
  }
}
