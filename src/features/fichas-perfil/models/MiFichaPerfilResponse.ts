export interface MiFichaPerfilAsesor {
  id: string;
  nombre: string;
  email: string;
}

export interface MiFichaPerfilEstadoActual {
  id: string;
  nombre: string;
  fechaActualizacion: string;
}

export interface MiFichaPerfilResponse {
  id: string;
  tituloProyecto: string;
  asesor: MiFichaPerfilAsesor;
  estadoActual: MiFichaPerfilEstadoActual;
}
