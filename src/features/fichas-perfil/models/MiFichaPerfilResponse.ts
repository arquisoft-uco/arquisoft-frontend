import type { Asesor } from './Asesor';
import type { Estudiante } from './Estudiante';

export interface MiFichaPerfilEstadoActual {
  id: string;
  nombre: string;
  fechaActualizacion: string;
}

export interface MiFichaPerfilResponse {
  id: string;
  tituloProyecto: string;
  asesor: Asesor;
  estadoActual: MiFichaPerfilEstadoActual;
  integrantes: Estudiante[];
}
