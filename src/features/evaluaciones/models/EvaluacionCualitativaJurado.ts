import type { CriterioItemCualitativoJurado } from './CriterioItemCualitativoJurado';
import type { ItemCualitativoJurado } from './ItemCualitativoJurado';

export interface EvaluacionCualitativaJurado {
  id: string;
  item: Omit<ItemCualitativoJurado, 'peso'>;
  criterio: CriterioItemCualitativoJurado;
}
