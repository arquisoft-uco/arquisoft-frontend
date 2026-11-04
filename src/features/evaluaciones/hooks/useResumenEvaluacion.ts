import { useState } from 'react';
import { useLocation } from 'react-router';
import type { NavegacionJuradosEvaluacion, ResumenEvaluacion } from '../models/ResumenEvaluacion';

interface ResultadoResumenEvaluacion {
  resumen: ResumenEvaluacion | null;
  search: string;
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null;
}

function leerNavegacion(state: unknown, evaluacionId: string): NavegacionJuradosEvaluacion | null {
  if (!esObjeto(state) || typeof state.search !== 'string') return null;
  const bruto = state.resumen;
  if (
    !esObjeto(bruto) ||
    bruto.id !== evaluacionId ||
    typeof bruto.proyecto !== 'string' ||
    typeof bruto.version !== 'number'
  ) {
    return null;
  }
  return {
    search: state.search,
    resumen: { id: evaluacionId, proyecto: bruto.proyecto, version: bruto.version },
  };
}

export function useResumenEvaluacion(evaluacionId: string): ResultadoResumenEvaluacion {
  const location = useLocation();
  const [navegacion] = useState(() => leerNavegacion(location.state, evaluacionId));

  return {
    resumen: navegacion?.resumen ?? null,
    search: navegacion?.search ?? '',
  };
}
