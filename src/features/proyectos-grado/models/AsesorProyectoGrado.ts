export interface EstadoAsesorProyecto {
  id: string;
  nombre: string;
}

export interface AsesorProyectoGrado {
  id: string;
  proyectoGradoId: string;
  asesorId: string;
  identificador: string;
  nombre: string;
  email: string;
  estado: EstadoAsesorProyecto;
  fechaAsignado: string;
  vigente: boolean;
  actual: boolean;
}
