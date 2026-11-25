import { useEffect } from 'react';
import type { ResumenFicha } from '../models/ResumenFicha';
import { useHistorialEstadosFichaRepresentante } from './useHistorialEstadosFichaRepresentante';
import { useResumenFicha } from './useResumenFicha';

interface ResultadoResumenFichaRepresentante {
  resumen: ResumenFicha | null;
  search: string;
}

export function useResumenFichaRepresentante(
  fichaId: string,
  ttlMs?: number,
): ResultadoResumenFichaRepresentante {
  const { resumen, search, actualizarResumen } = useResumenFicha(fichaId, ttlMs);
  const { data: historial } = useHistorialEstadosFichaRepresentante(fichaId);
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
