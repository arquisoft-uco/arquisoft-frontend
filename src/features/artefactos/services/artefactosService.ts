import apiClient from '../../../api/axiosInstance';
import type { EstadoRevisionAsesor } from '../models/artefactos';

export const artefactosService = {
  getEstadosRevisionAsesor: (): Promise<EstadoRevisionAsesor[]> =>
    apiClient.get<EstadoRevisionAsesor[]>('/estados-revision-asesor').then((r) => r.data),
};
