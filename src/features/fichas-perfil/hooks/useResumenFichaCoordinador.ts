import { useState } from 'react';
import type { Asesor } from '../../../shared/models/Asesor';
import type { ResumenFicha } from '../models/ResumenFicha';
import { useHistorialEstadosFichaCoordinador } from './useHistorialEstadosFichaCoordinador';
import { useResumenFicha } from './useResumenFicha';

interface ResultadoResumenFichaCoordinador {
  resumen: ResumenFicha | null;
  search: string;
  registrarAsesorNuevo: (asesor: Asesor) => void;
}

export function useResumenFichaCoordinador(fichaId: string): ResultadoResumenFichaCoordinador {
  const { resumen, search } = useResumenFicha(fichaId);
  const { data: historial } = useHistorialEstadosFichaCoordinador(fichaId);
  const [asesorNuevo, setAsesorNuevo] = useState<Asesor | null>(null);
  const estadoActual = historial?.[0];

  function registrarAsesorNuevo(asesor: Asesor) {
    setAsesorNuevo(asesor);
  }

  if (!resumen) return { resumen: null, search, registrarAsesorNuevo };

  return {
    resumen: {
      ...resumen,
      ...(estadoActual && {
        estadoId: estadoActual.id,
        estadoNombre: estadoActual.nombre,
        fechaActualizacion: estadoActual.fechaActualizacion,
      }),
      ...(asesorNuevo && {
        asesorId: asesorNuevo.id,
        asesorNombre: asesorNuevo.nombre,
        asesorEmail: asesorNuevo.email,
      }),
    },
    search,
    registrarAsesorNuevo,
  };
}
