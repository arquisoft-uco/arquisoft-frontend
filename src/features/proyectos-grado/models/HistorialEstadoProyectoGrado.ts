import type { EstadoProyecto } from './ProyectoGrado';

export interface HistorialEstadoProyectoGrado {
  id: string;
  estado: EstadoProyecto;
  fechaActualizacion: string;
}
