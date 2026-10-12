import type { EstadoProyectoGrado } from '../models/ProyectoGrado';

// El backend no expone catálogo de estados de proyecto de grado: las opciones del filtro van fijas.
export const ESTADOS_PROYECTO_GRADO: readonly EstadoProyectoGrado[] = [
  { id: 'EN_PROCESO', nombre: 'En proceso' },
  { id: 'LISTO_PARA_REVISION', nombre: 'Listo Para Revisión' },
  { id: 'ATRASADO', nombre: 'Atrasado' },
  { id: 'FINALIZADO', nombre: 'Finalizado' },
];
