import { useCallback } from 'react';
import { useContextoDeNavegacion } from '../../../shared/hooks/useContextoDeNavegacion';
import type { OrigenNavegacion } from '../../../shared/models/OrigenNavegacion';
import type { ResumenFicha } from '../models/ResumenFicha';
import { esquemaEstadoFicha, esquemaSnapshotFicha } from '../utils/contexto-ficha';

interface ResultadoResumenFicha {
  resumen: ResumenFicha | null;
  search: string;
  origen?: OrigenNavegacion;
  actualizarResumen: (cambios: Partial<ResumenFicha>) => void;
}

export function useResumenFicha(fichaId: string, ttlMs?: number): ResultadoResumenFicha {
  const { contexto, actualizar } = useContextoDeNavegacion({
    tipo: 'ficha',
    id: fichaId,
    esquemaEstado: esquemaEstadoFicha,
    esquemaSnapshot: esquemaSnapshotFicha,
    coincide: (valor) => valor.resumen.id === fichaId,
    ttlMs,
  });

  const actualizarResumen = useCallback(
    (cambios: Partial<ResumenFicha>) =>
      actualizar((previo) => ({ ...previo, resumen: { ...previo.resumen, ...cambios } })),
    [actualizar],
  );

  return {
    resumen: contexto?.resumen ?? null,
    search: contexto?.search ?? '',
    origen: contexto?.origen,
    actualizarResumen,
  };
}
