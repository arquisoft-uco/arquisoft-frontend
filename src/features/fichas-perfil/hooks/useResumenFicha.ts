import { useState } from 'react';
import { useLocation } from 'react-router';
import type { OrigenNavegacion } from '../../../shared/models/OrigenNavegacion';
import type { NavegacionDetalleFicha, ResumenFicha } from '../models/ResumenFicha';

const NAVEGACION_VACIA: NavegacionDetalleFicha | null = null;

interface ResultadoResumenFicha {
  resumen: ResumenFicha | null;
  search: string;
  origen?: OrigenNavegacion;
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null;
}

function cadenaOpcional(valor: unknown): string | undefined {
  return typeof valor === 'string' ? valor : undefined;
}

function leerOrigen(bruto: unknown): OrigenNavegacion | undefined {
  if (!esObjeto(bruto)) return undefined;
  const { etiqueta, to } = bruto;
  if (typeof etiqueta !== 'string' || etiqueta === '') return undefined;
  if (typeof to !== 'string' || !to.startsWith('/') || to.startsWith('//')) return undefined;
  return { etiqueta, to };
}

function leerNavegacion(state: unknown, fichaId: string): NavegacionDetalleFicha | null {
  if (!esObjeto(state) || typeof state.search !== 'string') return NAVEGACION_VACIA;
  const bruto = state.resumen;
  if (!esObjeto(bruto) || bruto.id !== fichaId || typeof bruto.titulo !== 'string') {
    return NAVEGACION_VACIA;
  }
  return {
    search: state.search,
    origen: leerOrigen(state.origen),
    resumen: {
      id: fichaId,
      titulo: bruto.titulo,
      estadoId: cadenaOpcional(bruto.estadoId),
      estadoNombre: cadenaOpcional(bruto.estadoNombre),
      fechaActualizacion: cadenaOpcional(bruto.fechaActualizacion),
      asesorId: cadenaOpcional(bruto.asesorId),
      asesorNombre: cadenaOpcional(bruto.asesorNombre),
      asesorEmail: cadenaOpcional(bruto.asesorEmail),
    },
  };
}

export function useResumenFicha(fichaId: string): ResultadoResumenFicha {
  const location = useLocation();
  const [navegacion] = useState(() => leerNavegacion(location.state, fichaId));

  return {
    resumen: navegacion?.resumen ?? null,
    search: navegacion?.search ?? '',
    origen: navegacion?.origen,
  };
}
