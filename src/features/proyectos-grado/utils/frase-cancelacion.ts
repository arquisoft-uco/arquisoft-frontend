export const FRASE_CONFIRMACION_CANCELACION = 'Cancelar proyecto de grado';

export function coincideFraseConfirmacion(texto: string): boolean {
  return texto.trim().toLowerCase() === FRASE_CONFIRMACION_CANCELACION.toLowerCase();
}
