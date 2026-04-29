export interface EstadoFichaPerfil {
  id: string;
  fichaPerfilId: string;
  estadoFichaId: string;
  fechaActualizacion: string;
}

export interface AgregarEstadoFichaPerfilRequest {
  fichaPerfilId: string;
  estadoFichaId: string;
}
