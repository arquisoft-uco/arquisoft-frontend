// Espeja EstadoItem.puedePasarA del backend; los nombres para mostrar salen siempre del catálogo.
export const TRANSICIONES_TAREA: Record<string, readonly string[]> = {
  NUEVA: ['EN_PROGRESO', 'FINALIZADA'],
  EN_PROGRESO: ['FINALIZADA'],
  FINALIZADA: [],
};

// Espeja EstadoItem.permiteRemocion del backend
export const ESTADOS_REMOVIBLES: readonly string[] = ['NUEVA', 'EN_PROGRESO'];

export function esTareaRemovible(id: string): boolean {
  return ESTADOS_REMOVIBLES.includes(id);
}

export const ESTADO_TAREA_FINALIZADA = 'FINALIZADA';

// Regla de UX: el backend no impide remover el plan de una tarea finalizada.
export function puedeRemoverPlanEstimado(estadoId: string): boolean {
  return estadoId !== ESTADO_TAREA_FINALIZADA;
}

export function destinosDeEstado(id: string): readonly string[] {
  return TRANSICIONES_TAREA[id] ?? [];
}
