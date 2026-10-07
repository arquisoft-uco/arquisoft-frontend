import apiClient from '../../../api/axiosInstance';
import type { ItemCualitativoJurado } from '../models/ItemCualitativoJurado';

export const evaluacionesService = {
  getItemsCualitativosJurado: (): Promise<ItemCualitativoJurado[]> =>
    apiClient
      .get<ItemCualitativoJurado[]>('/evaluaciones/items-cualitativos-jurado')
      .then((r) => r.data),
};
