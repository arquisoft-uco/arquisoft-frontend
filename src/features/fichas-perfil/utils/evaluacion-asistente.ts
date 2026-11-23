import type { EstadoEvaluacion, EvaluacionFichaPerfil } from '../models/fichas-perfil';

export type PasoAsistente = 'iniciar' | 'observaciones' | 'estado';

export const ESTADOS_SIN_OBSERVACIONES = ['APROBADA', 'NO_APROBADA'];
export const ESTADOS_CON_OBSERVACIONES = ['APROBADA_CON_OBSERVACIONES', 'NO_APROBADA'];
const ESTADOS_FINALES = ['APROBADA', 'APROBADA_CON_OBSERVACIONES', 'NO_APROBADA', 'DESCARTADA'];

export const PREGUNTA_GUIA_POR_ESTADO: Record<string, string> = {
  APROBADA: '¿La ficha cumple sin reservas?',
  APROBADA_CON_OBSERVACIONES: '¿Cumple, pero con ajustes por hacer?',
  NO_APROBADA: '¿No cumple lo necesario para continuar?',
};

export function estadosParaDecidir(
  catalogo: EstadoEvaluacion[],
  tieneObservaciones: boolean,
): EstadoEvaluacion[] {
  const permitidos = tieneObservaciones ? ESTADOS_CON_OBSERVACIONES : ESTADOS_SIN_OBSERVACIONES;
  return catalogo.filter((estado) => permitidos.includes(estado.id));
}

export function textoObservacionesParaEstado(cantidad: number): string {
  if (cantidad === 0) {
    return 'No registraste observaciones, así que puedes aprobarla o no aprobarla.';
  }
  const registradas = cantidad === 1 ? '1 observación' : `${cantidad} observaciones`;
  return `Registraste ${registradas}, así que puedes aprobarla con observaciones o no aprobarla.`;
}

export function evaluacionEnEstadoFinal(evaluacion: EvaluacionFichaPerfil): boolean {
  return (
    evaluacion.estadoEvaluacionId !== null &&
    ESTADOS_FINALES.includes(evaluacion.estadoEvaluacionId)
  );
}
