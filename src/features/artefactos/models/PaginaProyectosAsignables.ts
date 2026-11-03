import type { ProyectoAsignable } from './ProyectoAsignable';

export interface PaginaProyectosAsignables {
  proyectos: ProyectoAsignable[];
  siguientePagina: number | null;
}
