export interface ResumenFicha {
  id: string;
  titulo: string;
  estadoId?: string;
  estadoNombre?: string;
  fechaActualizacion?: string;
  asesorId?: string;
  asesorNombre?: string;
  asesorEmail?: string;
}

export interface NavegacionDetalleFicha {
  resumen: ResumenFicha;
  search: string;
}
