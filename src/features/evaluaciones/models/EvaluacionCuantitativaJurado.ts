import type { ItemCuantitativoJurado } from './ItemCuantitativoJurado';

export interface EvaluacionCuantitativaJurado {
  id: string;
  puntaje: number;
  item: ItemCuantitativoJurado;
}
