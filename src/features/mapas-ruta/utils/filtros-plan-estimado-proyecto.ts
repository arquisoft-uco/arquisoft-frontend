import type { NodoFiltroDTO } from '../../../shared/models/query-criteria';
import { LIMITES } from '../../../shared/validation';

const TEXTO_MAX = Math.max(LIMITES.TAREA_DESCRIPCION_MAX, LIMITES.PLAN_ESTIMADO_DESCRIPCION_MAX);

export function construirFiltrosPlanEstimadoProyecto(texto: string): NodoFiltroDTO | undefined {
  const recortado = texto.trim().slice(0, TEXTO_MAX);
  if (!recortado) return undefined;
  return {
    tipo: 'GRUPO',
    conector: 'OR',
    nodos: [
      { tipo: 'PREDICADO', campo: 'descripcionTarea', operador: 'CONTIENE', valor: recortado },
      { tipo: 'PREDICADO', campo: 'descripcionEstimado', operador: 'CONTIENE', valor: recortado },
    ],
  };
}
