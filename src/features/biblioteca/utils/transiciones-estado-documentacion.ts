export type DestinoEstadoDocumentacion = 'PUBLICADO' | 'NO_PUBLICADO';

const DESTINOS_POR_ESTADO: Record<string, DestinoEstadoDocumentacion[]> = {
  PENDIENTE: ['PUBLICADO', 'NO_PUBLICADO'],
  PUBLICADO: ['NO_PUBLICADO'],
  NO_PUBLICADO: ['PUBLICADO'],
};

export function destinosPermitidos(estadoId: string): DestinoEstadoDocumentacion[] {
  return DESTINOS_POR_ESTADO[estadoId] ?? [];
}

export function esCompartible(estadoId: string): boolean {
  return estadoId === 'PUBLICADO';
}
