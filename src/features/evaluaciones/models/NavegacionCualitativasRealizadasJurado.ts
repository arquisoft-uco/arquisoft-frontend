export interface NavegacionCualitativasRealizadasJurado {
  evaluacionJuradoId: string;
  search: string;
  evaluacionFinalizada: boolean;
  resumen: { proyecto: string; version: number } | null;
}
