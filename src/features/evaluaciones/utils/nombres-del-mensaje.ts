import { getApiErrorMessage } from '../../../shared/utils/api-error';

// El backend entrega los UUID dentro del texto del mensaje, sin campo estructurado.
const UUID_EN_TEXTO = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

export function nombresDelMensaje(
  err: unknown,
  nombresPorId: ReadonlyMap<string, string>,
): string[] {
  const mensaje = getApiErrorMessage(err, '');
  const ids = mensaje.match(UUID_EN_TEXTO) ?? [];
  const nombres: string[] = [];
  for (const id of ids) {
    const nombre = nombresPorId.get(id) ?? nombresPorId.get(id.toLowerCase());
    if (nombre && !nombres.includes(nombre)) nombres.push(nombre);
  }
  return nombres;
}
