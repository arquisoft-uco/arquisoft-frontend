import type { EstadoFicha } from '../models/fichas-perfil';
import { ESTADO_FICHA_DECIDIBLE } from './decision-ficha';

// Ayuda de UX: la fuente de verdad de las transiciones es EstadoFicha.java del backend.
export const DESTINOS_POR_ESTADO: Record<string, readonly string[]> = {
  EN_CONSTRUCCION: ['DISPONIBLE_PARA_EVALUACION', 'DESCARTADA'],
  DISPONIBLE_PARA_EVALUACION: ['EN_CONSTRUCCION', 'DESCARTADA'],
  DESCARTADA: ['EN_CONSTRUCCION'],
};

export function admiteCambioDeEstado(estadoId: string | undefined): boolean {
  if (!estadoId) return false;
  return (DESTINOS_POR_ESTADO[estadoId]?.length ?? 0) > 0;
}

export function estadosDestino(estadoActualId: string, catalogo: EstadoFicha[]): EstadoFicha[] {
  const destinos = DESTINOS_POR_ESTADO[estadoActualId] ?? [];
  return catalogo.filter((estado) => destinos.includes(estado.id));
}

export interface BloqueoSalidaFicha {
  motivo: 'en-curso' | 'en-espera';
  cantidad: number;
}

const ESTADOS_EVALUACION_FINALIZADOS = ['APROBADA', 'APROBADA_CON_OBSERVACIONES', 'NO_APROBADA'];

// Ayuda de UX: el backend es la autoridad (422 EVALUACION_EN_CURSO y EN_ESPERA_DE_DECISION).
export function bloqueoDeSalida(
  estadoId: string | undefined,
  evaluaciones: { estadoEvaluacionId: string | null }[],
): BloqueoSalidaFicha | null {
  if (estadoId !== ESTADO_FICHA_DECIDIBLE) return null;
  const enCurso = evaluaciones.filter((e) => e.estadoEvaluacionId === 'EN_EVALUACION').length;
  if (enCurso > 0) return { motivo: 'en-curso', cantidad: enCurso };
  const finalizadas = evaluaciones.filter(
    (e) =>
      e.estadoEvaluacionId !== null &&
      ESTADOS_EVALUACION_FINALIZADOS.includes(e.estadoEvaluacionId),
  ).length;
  if (finalizadas > 0) return { motivo: 'en-espera', cantidad: finalizadas };
  return null;
}
