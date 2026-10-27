export interface DatosSubidaVersion {
  archivo: File;
  nombreDocumento: string;
  nuevoDocumento: boolean;
}

export type FaseSubidaVersion = 'solicitando' | 'subiendo' | 'registrando';
