import apiClient from '../../../api/axiosInstance';
import type { EstadoEntregable } from '../models/entregables';

export const entregablesService = {
  getEstadosEntregable: (): Promise<EstadoEntregable[]> =>
    apiClient.get<EstadoEntregable[]>('/estados-entregable').then((r) => r.data),
};
