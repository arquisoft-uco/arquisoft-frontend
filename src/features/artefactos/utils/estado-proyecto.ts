import type { OpcionFiltro } from '../../../shared/components/ui/FilterBar';
import type { NodoFiltroDTO } from '../../../shared/models/query-criteria';

export type EstadoProyectoListado = '' | 'finalizados' | 'cancelados';

export const OPCIONES_ESTADO_PROYECTO: OpcionFiltro[] = [
  { id: '', etiqueta: 'Habilitados' },
  { id: 'finalizados', etiqueta: 'Finalizados' },
  { id: 'cancelados', etiqueta: 'Cancelados' },
];

export function leerEstadoProyecto(valor: string): EstadoProyectoListado {
  return valor === 'finalizados' || valor === 'cancelados' ? valor : '';
}

function predicado(campo: string, valor: 'true' | 'false'): NodoFiltroDTO {
  return { tipo: 'PREDICADO', campo, operador: 'ES', valor };
}

export function filtrosEstadoProyecto(estado: EstadoProyectoListado): NodoFiltroDTO[] {
  if (estado === 'finalizados') return [predicado('proyectoFinalizado', 'true')];
  if (estado === 'cancelados') return [predicado('proyectoCancelado', 'true')];
  return [predicado('proyectoFinalizado', 'false'), predicado('proyectoCancelado', 'false')];
}

export function textoAlcanceEstadoProyecto(estado: EstadoProyectoListado): string {
  if (estado === 'finalizados') return 'de proyectos finalizados';
  if (estado === 'cancelados') return 'de proyectos cancelados';
  return 'de proyectos habilitados';
}

export function estaCerrado({
  proyectoFinalizado,
  proyectoCancelado,
}: {
  proyectoFinalizado: boolean;
  proyectoCancelado: boolean;
}): boolean {
  return proyectoFinalizado || proyectoCancelado;
}
