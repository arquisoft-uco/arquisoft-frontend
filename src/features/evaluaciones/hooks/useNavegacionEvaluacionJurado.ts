import { useState } from 'react';
import { useLocation } from 'react-router';
import type { NavegacionEvaluacionJurado } from '../models/NavegacionEvaluacionJurado';
import type { ResumenEvaluacion } from '../models/ResumenEvaluacion';

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null;
}

function leerResumen(bruto: unknown, evaluacionId: string): ResumenEvaluacion | null | undefined {
  if (bruto === null) return null;
  if (
    !esObjeto(bruto) ||
    bruto.id !== evaluacionId ||
    typeof bruto.proyecto !== 'string' ||
    typeof bruto.version !== 'number'
  ) {
    return undefined;
  }
  return { id: evaluacionId, proyecto: bruto.proyecto, version: bruto.version };
}

function leerNavegacion(
  state: unknown,
  evaluacionJuradoId: string,
): NavegacionEvaluacionJurado | null {
  if (
    !esObjeto(state) ||
    state.evaluacionJuradoId !== evaluacionJuradoId ||
    typeof state.evaluacionId !== 'string' ||
    typeof state.jurado !== 'string' ||
    typeof state.search !== 'string' ||
    typeof state.searchJurados !== 'string'
  ) {
    return null;
  }
  const resumen = leerResumen(state.resumen, state.evaluacionId);
  if (resumen === undefined) return null;
  return {
    evaluacionJuradoId,
    evaluacionId: state.evaluacionId,
    jurado: state.jurado,
    resumen,
    search: state.search,
    searchJurados: state.searchJurados,
  };
}

export function useNavegacionEvaluacionJurado(
  evaluacionJuradoId: string,
): NavegacionEvaluacionJurado | null {
  const location = useLocation();
  const [navegacion] = useState(() => leerNavegacion(location.state, evaluacionJuradoId));
  return navegacion;
}
