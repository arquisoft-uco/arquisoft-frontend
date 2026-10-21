import { useState } from 'react';
import { useLocation } from 'react-router';
import type {
  NavegacionDetalleProyecto,
  ResumenProyectoGrado,
} from '../models/ResumenProyectoGrado';

interface ResultadoResumenProyectoGrado {
  resumen: ResumenProyectoGrado | null;
  search: string;
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null;
}

function cadenaOpcional(valor: unknown): string | undefined {
  return typeof valor === 'string' ? valor : undefined;
}

function leerNavegacion(state: unknown, proyectoId: string): NavegacionDetalleProyecto | null {
  if (!esObjeto(state) || typeof state.search !== 'string') return null;
  const bruto = state.resumen;
  if (!esObjeto(bruto) || bruto.id !== proyectoId || typeof bruto.titulo !== 'string') {
    return null;
  }
  return {
    search: state.search,
    resumen: {
      id: proyectoId,
      titulo: bruto.titulo,
      estadoId: cadenaOpcional(bruto.estadoId),
      estadoNombre: cadenaOpcional(bruto.estadoNombre),
    },
  };
}

export function useResumenProyectoGrado(proyectoId: string): ResultadoResumenProyectoGrado {
  const location = useLocation();
  const [navegacion] = useState(() => leerNavegacion(location.state, proyectoId));

  return {
    resumen: navegacion?.resumen ?? null,
    search: navegacion?.search ?? '',
  };
}
