export interface NavegacionCuantitativasAsesor {
  evaluacionAsesorId: string;
  search: string;
  evaluacionFinalizada: boolean;
  resumen: { proyecto: string; version: number } | null;
}
