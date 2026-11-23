import { useEffect } from 'react';
import type { Asesor } from '../../../shared/models/Asesor';
import type { OrigenNavegacion } from '../../../shared/models/OrigenNavegacion';
import type { ResumenFicha } from '../models/ResumenFicha';
import { useHistorialEstadosFichaCoordinador } from './useHistorialEstadosFichaCoordinador';
import { useResumenFicha } from './useResumenFicha';

interface ResultadoResumenFichaCoordinador {
  resumen: ResumenFicha | null;
  search: string;
  origen?: OrigenNavegacion;
  registrarAsesorNuevo: (asesor: Asesor) => void;
}

export function useResumenFichaCoordinador(fichaId: string): ResultadoResumenFichaCoordinador {
  const { resumen, search, origen, actualizarResumen } = useResumenFicha(fichaId);
  const { data: historial } = useHistorialEstadosFichaCoordinador(fichaId);
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

  function registrarAsesorNuevo(asesor: Asesor) {
    actualizarResumen({
      asesorId: asesor.id,
      asesorNombre: asesor.nombre,
      asesorEmail: asesor.email,
    });
  }

  if (!resumen) return { resumen: null, search, origen, registrarAsesorNuevo };

  return {
    resumen: {
      ...resumen,
      ...(estadoActual && {
        estadoId: estadoActual.id,
        estadoNombre: estadoActual.nombre,
        fechaActualizacion: estadoActual.fechaActualizacion,
      }),
    },
    search,
    origen,
    registrarAsesorNuevo,
  };
}
