export interface NavegacionCualitativasAsesor {
  evaluacionAsesorId: string;
  search: string;
  resumen: { proyecto: string; version: number } | null;
  evaluacionFinalizada: boolean;
}
