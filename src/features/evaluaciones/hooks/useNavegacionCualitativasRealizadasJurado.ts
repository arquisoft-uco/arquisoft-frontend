import { useState } from 'react';
import { useLocation } from 'react-router';
import type { NavegacionCualitativasRealizadasJurado } from '../models/NavegacionCualitativasRealizadasJurado';

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null;
}

function leerResumen(
  bruto: unknown,
): NavegacionCualitativasRealizadasJurado['resumen'] | undefined {
  if (bruto === null) return null;
  if (!esObjeto(bruto) || typeof bruto.proyecto !== 'string' || typeof bruto.version !== 'number') {
    return undefined;
  }
  return { proyecto: bruto.proyecto, version: bruto.version };
}

function leerNavegacion(
  state: unknown,
  evaluacionJuradoId: string,
): NavegacionCualitativasRealizadasJurado | null {
  if (
    !esObjeto(state) ||
    state.evaluacionJuradoId !== evaluacionJuradoId ||
    typeof state.search !== 'string'
  ) {
    return null;
  }
  const resumen = leerResumen(state.resumen);
  if (resumen === undefined) return null;
  return { evaluacionJuradoId, search: state.search, resumen };
}

export function useNavegacionCualitativasRealizadasJurado(
  evaluacionJuradoId: string,
): NavegacionCualitativasRealizadasJurado | null {
  const location = useLocation();
  const [navegacion] = useState(() => leerNavegacion(location.state, evaluacionJuradoId));
  return navegacion;
}
