import type { ProyectoElegible } from './ProyectoElegible';

export interface PaginaProyectosElegibles {
  proyectos: ProyectoElegible[];
  siguientePagina: number | null;
}
