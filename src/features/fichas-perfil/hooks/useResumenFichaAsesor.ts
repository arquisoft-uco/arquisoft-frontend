import type { ResumenFicha } from '../models/ResumenFicha';
import { useHistorialEstadosFichaAsesor } from './useHistorialEstadosFichaAsesor';
import { useResumenFicha } from './useResumenFicha';

interface ResultadoResumenFichaAsesor {
  resumen: ResumenFicha | null;
  search: string;
}

export function useResumenFichaAsesor(fichaId: string): ResultadoResumenFichaAsesor {
  const { resumen, search } = useResumenFicha(fichaId);
  const { data: historial } = useHistorialEstadosFichaAsesor(fichaId);
  const estadoActual = historial?.[0];

  if (!resumen || !estadoActual) return { resumen, search };

  return {
    resumen: {
      ...resumen,
      estadoId: estadoActual.id,
      estadoNombre: estadoActual.nombre,
      fechaActualizacion: estadoActual.fechaActualizacion,
    },
    search,
  };
}
