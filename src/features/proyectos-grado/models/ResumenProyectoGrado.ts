export interface ResumenProyectoGrado {
  id: string;
  titulo: string;
  estadoId?: string;
  estadoNombre?: string;
}

export interface NavegacionDetalleProyecto {
  resumen: ResumenProyectoGrado;
  search: string;
}
