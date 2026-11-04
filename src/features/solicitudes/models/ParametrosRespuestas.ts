export type OrdenCampoRespuesta = 'fechaRespuesta' | 'destinatarioNombre';

export type OrdenDireccionRespuesta = 'ASC' | 'DESC';

export interface ParametrosRespuestas {
  page: number;
  estadoIds: string[];
  ordenCampo: OrdenCampoRespuesta;
  ordenDireccion: OrdenDireccionRespuesta;
}
