export const FRASE_CONFIRMACION_CANCELACION = 'Cancelar proyecto de grado';
export const FRASE_CONFIRMACION_FINALIZACION = 'Finalizar proyecto de grado';

export function coincideFrase(texto: string, frase: string): boolean {
  return texto.trim().toLowerCase() === frase.toLowerCase();
}
