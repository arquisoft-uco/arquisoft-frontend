import type { CriterioItemCualitativoAsesor } from './CriterioItemCualitativoAsesor';
import type { ItemCualitativoAsesor } from './ItemCualitativoAsesor';

export interface EvaluacionCualitativaAsesor {
  id: string;
  item: ItemCualitativoAsesor;
  criterio: CriterioItemCualitativoAsesor;
}
