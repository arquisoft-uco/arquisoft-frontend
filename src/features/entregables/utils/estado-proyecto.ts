import type { NodoFiltroDTO } from '../../../shared/models/query-criteria';
import type { EntregableProyectoGrado } from '../models/EntregableProyectoGrado';
import { ESTADO_CANCELADO, ESTADO_CERRADO } from './estados-entregable';

export type EstadoProyectoListado = 'activos' | 'finalizados';

export const OPCIONES_ESTADO_PROYECTO: { id: EstadoProyectoListado; etiqueta: string }[] = [
  { id: 'activos', etiqueta: 'Activos' },
  { id: 'finalizados', etiqueta: 'Finalizados' },
];

export function leerEstadoProyecto(valor: string): EstadoProyectoListado {
  return valor === 'finalizados' ? 'finalizados' : 'activos';
}

export function predicadoEstadoProyecto(estado: EstadoProyectoListado): NodoFiltroDTO | undefined {
  if (estado !== 'finalizados') return undefined;
  return { tipo: 'PREDICADO', campo: 'proyectoFinalizado', operador: 'ES', valor: 'true' };
}

export function textoAlcanceEstadoProyecto(estado: EstadoProyectoListado): string {
  return estado === 'finalizados' ? 'de proyectos finalizados' : 'de proyectos activos';
}

type ProyectoDelEntregable = Pick<
  EntregableProyectoGrado,
  'proyectoFinalizado' | 'proyectoCancelado'
>;

export function proyectoCerrado(e: ProyectoDelEntregable): boolean {
  return e.proyectoFinalizado || e.proyectoCancelado;
}

export function puedeDescargarPaquete(
  e: ProyectoDelEntregable & { estadoEntregable: { id: string } },
): boolean {
  if (e.proyectoCancelado || e.estadoEntregable.id === ESTADO_CANCELADO) return false;
  return !e.proyectoFinalizado || e.estadoEntregable.id === ESTADO_CERRADO;
}
