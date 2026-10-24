import type { EstadoFicha } from '../models/fichas-perfil';

// Ayuda de UX: la fuente de verdad de las transiciones es EstadoFicha.java del backend.
export const DESTINOS_POR_ESTADO: Record<string, readonly string[]> = {
  EN_CONSTRUCCION: ['DISPONIBLE_PARA_EVALUACION', 'DESCARTADA'],
  DISPONIBLE_PARA_EVALUACION: ['EN_CONSTRUCCION', 'DESCARTADA'],
  DESCARTADA: ['EN_CONSTRUCCION'],
};

export function estadosDestino(estadoActualId: string, catalogo: EstadoFicha[]): EstadoFicha[] {
  const destinos = DESTINOS_POR_ESTADO[estadoActualId] ?? [];
  return catalogo.filter((estado) => destinos.includes(estado.id));
}
