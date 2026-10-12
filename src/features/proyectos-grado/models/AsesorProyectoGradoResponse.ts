export interface AsesorProyectoGradoResponse {
  id: string;
  proyectoGradoId: string;
  asesorId: string;
  identificador: string;
  nombre: string;
  email: string;
  estadoAsesor: string;
  estadoAsesorNombre: string;
  fechaAsignado: string;
  vigente: boolean;
  actual: boolean;
}
