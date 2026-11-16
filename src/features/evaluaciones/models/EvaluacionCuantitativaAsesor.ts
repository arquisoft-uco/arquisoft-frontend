import type { ItemCuantitativoAsesor } from './ItemCuantitativoAsesor';

export interface EvaluacionCuantitativaAsesor {
  id: string;
  puntaje: number;
  item: ItemCuantitativoAsesor;
}
