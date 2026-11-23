import { useEffect } from 'react';
import type { ResumenFicha } from '../models/ResumenFicha';
import { useHistorialEstadosFichaAsesor } from './useHistorialEstadosFichaAsesor';
import { useResumenFicha } from './useResumenFicha';

interface ResultadoResumenFichaAsesor {
  resumen: ResumenFicha | null;
  search: string;
}

export function useResumenFichaAsesor(fichaId: string): ResultadoResumenFichaAsesor {
  const { resumen, search, actualizarResumen } = useResumenFicha(fichaId);
  const { data: historial } = useHistorialEstadosFichaAsesor(fichaId);
  const estadoActual = historial?.[0];
  const guardadoId = resumen?.estadoId;
  const guardadoFecha = resumen?.fechaActualizacion;

  useEffect(() => {
    if (!estadoActual) return;
    if (estadoActual.id === guardadoId && estadoActual.fechaActualizacion === guardadoFecha) return;
    actualizarResumen({
      estadoId: estadoActual.id,
      estadoNombre: estadoActual.nombre,
      fechaActualizacion: estadoActual.fechaActualizacion,
    });
  }, [estadoActual, guardadoId, guardadoFecha, actualizarResumen]);

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
