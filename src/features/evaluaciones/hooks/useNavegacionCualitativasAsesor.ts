import { useState } from 'react';
import { useLocation } from 'react-router';
import type { NavegacionCualitativasAsesor } from '../models/NavegacionCualitativasAsesor';

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null;
}

function leerResumen(bruto: unknown): NavegacionCualitativasAsesor['resumen'] | undefined {
  if (bruto === null) return null;
  if (!esObjeto(bruto) || typeof bruto.proyecto !== 'string' || typeof bruto.version !== 'number') {
    return undefined;
  }
  return { proyecto: bruto.proyecto, version: bruto.version };
}

function leerNavegacion(
  state: unknown,
  evaluacionAsesorId: string,
): NavegacionCualitativasAsesor | null {
  if (
    !esObjeto(state) ||
    state.evaluacionAsesorId !== evaluacionAsesorId ||
    typeof state.search !== 'string'
  ) {
    return null;
  }
  const resumen = leerResumen(state.resumen);
  if (resumen === undefined) return null;
  return { evaluacionAsesorId, search: state.search, resumen };
}

export function useNavegacionCualitativasAsesor(
  evaluacionAsesorId: string,
): NavegacionCualitativasAsesor | null {
  const location = useLocation();
  const [navegacion] = useState(() => leerNavegacion(location.state, evaluacionAsesorId));
  return navegacion;
}
