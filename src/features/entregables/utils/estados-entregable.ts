export const ESTADO_CANCELADO = 'CANCELADO';
export const ESTADO_CERRADO = 'CERRADO';

export const ESTADOS_DESTINO: readonly string[] = [ESTADO_CANCELADO, ESTADO_CERRADO];
export const ESTADOS_CERRABLES: readonly string[] = ['APROBADO', 'APROBADO_CON_OBSERVACIONES'];
export const ESTADOS_TERMINALES: readonly string[] = [ESTADO_CANCELADO, ESTADO_CERRADO];

export function puedeCambiarEstado(id: string): boolean {
  return !ESTADOS_TERMINALES.includes(id);
}

export function puedeCerrar(id: string): boolean {
  return ESTADOS_CERRABLES.includes(id);
}
