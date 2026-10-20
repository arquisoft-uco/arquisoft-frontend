export type OrdenCampoRespuesta = 'fechaRespuesta' | 'destinatarioNombre';

export type OrdenDireccionRespuesta = 'ASC' | 'DESC';

export interface ParametrosRespuestas {
  page: number;
  texto: string;
  estadoIds: string[];
  ordenCampo: OrdenCampoRespuesta;
  ordenDireccion: OrdenDireccionRespuesta;
}
