import type { NodoFiltroDTO } from '../../../shared/models/query-criteria';
import { LIMITES } from '../../../shared/validation';

const MAXIMO_BUSQUEDA = Math.min(LIMITES.TAREA_DESCRIPCION_MAX, LIMITES.PLAN_REAL_DESCRIPCION_MAX);

export function construirFiltrosPlanRealProyecto(texto: string): NodoFiltroDTO | undefined {
  const recortado = texto.trim().slice(0, MAXIMO_BUSQUEDA);
  if (!recortado) return undefined;
  return {
    tipo: 'GRUPO',
    conector: 'OR',
    nodos: [
      { tipo: 'PREDICADO', campo: 'descripcionTarea', operador: 'CONTIENE', valor: recortado },
      { tipo: 'PREDICADO', campo: 'descripcionReal', operador: 'CONTIENE', valor: recortado },
    ],
  };
}
