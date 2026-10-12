import type { EstadoProyecto } from '../models/ProyectoGrado';

// El backend no expone catálogo de estados de proyecto de grado: las opciones del filtro van fijas.
export const ESTADOS_PROYECTO: readonly EstadoProyecto[] = [
  { id: 'EN_PROCESO', nombre: 'En proceso' },
  { id: 'LISTO_PARA_REVISION', nombre: 'Listo Para Revisión' },
  { id: 'ATRASADO', nombre: 'Atrasado' },
  { id: 'FINALIZADO', nombre: 'Finalizado' },
];

export const ESTADO_FINALIZADO = 'FINALIZADO';
