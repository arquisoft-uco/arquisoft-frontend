// Espeja EstadoItem.puedePasarA del backend; los nombres para mostrar salen siempre del catálogo.
export const TRANSICIONES_TAREA: Record<string, readonly string[]> = {
  NUEVA: ['EN_PROGRESO', 'FINALIZADA'],
  EN_PROGRESO: ['FINALIZADA'],
  FINALIZADA: [],
};

export function destinosDeEstado(id: string): readonly string[] {
  return TRANSICIONES_TAREA[id] ?? [];
}
