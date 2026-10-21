export interface Usuario {
  id: string;
  identificador: string;
  nombre: string;
  email: string;
  contacto: string;
  estado: string;
  vigente: boolean;
  esEstudiante: boolean;
  esAsesor: boolean;
  esAsesorFicha: boolean;
  esCoordinador: boolean;
  esRepresentanteComite: boolean;
  esAdministrador: boolean;
  esBibliotecario: boolean;
}
