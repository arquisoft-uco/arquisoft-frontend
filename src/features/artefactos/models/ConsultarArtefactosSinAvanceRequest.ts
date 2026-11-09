import type { ConsultaCriteriaRequest } from '../../../shared/models/query-criteria';

export interface ConsultarArtefactosSinAvanceRequest {
  diasSinAvance: number;
  criterio: ConsultaCriteriaRequest;
}
