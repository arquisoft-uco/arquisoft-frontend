import { getApiErrorStatus } from './api-error';

export const REINTENTOS_MAXIMOS = 2;

const ESTADOS_TRANSITORIOS = [408, 429];

export function debeReintentarConsulta(intentos: number, error: unknown): boolean {
  if (intentos >= REINTENTOS_MAXIMOS) return false;
  const status = getApiErrorStatus(error);
  const esErrorDeCliente =
    status !== undefined && status >= 400 && status < 500 && !ESTADOS_TRANSITORIOS.includes(status);
  return !esErrorDeCliente;
}
