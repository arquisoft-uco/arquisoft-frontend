import apiClient from '../../../api/axiosInstance';
import type { ItemCualitativoJurado } from '../models/ItemCualitativoJurado';
import type { RegistrarItemCualitativoJuradoRequest } from '../models/RegistrarItemCualitativoJuradoRequest';
import type { RegistrarItemCualitativoJuradoResponse } from '../models/RegistrarItemCualitativoJuradoResponse';

export const evaluacionesService = {
  getItemsCualitativosJurado: (): Promise<ItemCualitativoJurado[]> =>
    apiClient
      .get<ItemCualitativoJurado[]>('/evaluaciones/items-cualitativos-jurado')
      .then((r) => r.data),

  registrarItemCualitativoJurado: (
    req: RegistrarItemCualitativoJuradoRequest,
  ): Promise<RegistrarItemCualitativoJuradoResponse> =>
    apiClient
      .post<RegistrarItemCualitativoJuradoResponse>('/evaluaciones/items-cualitativos-jurado', req)
      .then((r) => r.data),
};
