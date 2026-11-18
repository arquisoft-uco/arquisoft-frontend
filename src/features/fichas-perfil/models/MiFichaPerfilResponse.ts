import type { Asesor } from '../../../shared/models/Asesor';

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
}
