import type { EstadoProyecto } from '../models/ProyectoGrado';

// El backend no expone catálogo de estados de proyecto de grado: las opciones del filtro van fijas.
export const ESTADOS_PROYECTO: readonly EstadoProyecto[] = [
  { id: 'EN_PROCESO', nombre: 'En proceso' },
  { id: 'ATRASADO', nombre: 'Atrasado' },
  { id: 'FINALIZADO', nombre: 'Finalizado' },
  { id: 'CANCELADO', nombre: 'Cancelado' },
];

export const OPCIONES_ESTADO_PROYECTO = ESTADOS_PROYECTO.map((e) => ({
  id: e.id,
  etiqueta: e.nombre,
}));

export const ESTADO_FINALIZADO = 'FINALIZADO';
export const ESTADO_CANCELADO = 'CANCELADO';

const ESTADOS_CANCELABLES: readonly string[] = ['EN_PROCESO', 'ATRASADO'];
const ESTADOS_FINALIZABLES: readonly string[] = ['EN_PROCESO', 'ATRASADO'];

export function puedeCancelarProyecto(estadoId?: string): boolean {
  return estadoId === undefined || ESTADOS_CANCELABLES.includes(estadoId);
}

export function puedeFinalizarProyecto(estadoId?: string): boolean {
  return estadoId !== undefined && ESTADOS_FINALIZABLES.includes(estadoId);
}

export function esSoloLectura(estadoId?: string): boolean {
  return estadoId === ESTADO_FINALIZADO || estadoId === ESTADO_CANCELADO;
}
