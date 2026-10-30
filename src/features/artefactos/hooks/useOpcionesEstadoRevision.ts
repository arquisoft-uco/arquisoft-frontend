import { SIN_REVISION } from '../utils/filtros-versiones-artefacto';
import { useEstadosRevisionAsesor } from './useEstadosRevisionAsesor';

interface OpcionEstadoRevision {
  id: string;
  etiqueta: string;
}

export function useOpcionesEstadoRevision(): OpcionEstadoRevision[] | undefined {
  const { data } = useEstadosRevisionAsesor();
  if (!data) return undefined;
  return [
    { id: SIN_REVISION, etiqueta: 'Sin revisión' },
    ...data.map((estado) => ({ id: estado.id, etiqueta: estado.nombre })),
  ];
}
