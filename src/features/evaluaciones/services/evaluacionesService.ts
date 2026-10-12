import apiClient from '../../../api/axiosInstance';
import type { CategoriaItemCuantitativoJurado } from '../models/CategoriaItemCuantitativoJurado';
import type { CriterioItemCualitativoJurado } from '../models/CriterioItemCualitativoJurado';
import type { ItemCualitativoJurado } from '../models/ItemCualitativoJurado';
import type { ItemCuantitativoJurado } from '../models/ItemCuantitativoJurado';
import type { ModificarItemCualitativoJuradoRequest } from '../models/ModificarItemCualitativoJuradoRequest';
import type { ModificarItemCuantitativoJuradoRequest } from '../models/ModificarItemCuantitativoJuradoRequest';
import type { RegistrarItemCualitativoJuradoRequest } from '../models/RegistrarItemCualitativoJuradoRequest';
import type { RegistrarItemCualitativoJuradoResponse } from '../models/RegistrarItemCualitativoJuradoResponse';
import type { RegistrarItemCuantitativoJuradoRequest } from '../models/RegistrarItemCuantitativoJuradoRequest';
import type { RegistrarItemCuantitativoJuradoResponse } from '../models/RegistrarItemCuantitativoJuradoResponse';

export const evaluacionesService = {
  getItemsCualitativosJurado: (): Promise<ItemCualitativoJurado[]> =>
    apiClient
      .get<ItemCualitativoJurado[]>('/evaluaciones/items-cualitativos-jurado')
      .then((r) => r.data),

  getItemsCuantitativosJurado: (): Promise<ItemCuantitativoJurado[]> =>
    apiClient
      .get<ItemCuantitativoJurado[]>('/evaluaciones/items-cuantitativos-jurado')
      .then((r) => r.data),

  getCategoriasItemCuantitativoJurado: (): Promise<CategoriaItemCuantitativoJurado[]> =>
    apiClient
      .get<CategoriaItemCuantitativoJurado[]>('/evaluaciones/categorias-item-cuantitativo-jurado')
      .then((r) => r.data),

  getCriteriosItemCualitativoJurado: (): Promise<CriterioItemCualitativoJurado[]> =>
    apiClient
      .get<CriterioItemCualitativoJurado[]>('/evaluaciones/criterios-item-cualitativo-jurado')
      .then((r) => r.data),

  registrarItemCualitativoJurado: (
    req: RegistrarItemCualitativoJuradoRequest,
  ): Promise<RegistrarItemCualitativoJuradoResponse> =>
    apiClient
      .post<RegistrarItemCualitativoJuradoResponse>('/evaluaciones/items-cualitativos-jurado', req)
      .then((r) => r.data),

  registrarItemCuantitativoJurado: ({
    nombre,
    descripcion,
    categoriaId,
    valor,
  }: RegistrarItemCuantitativoJuradoRequest): Promise<RegistrarItemCuantitativoJuradoResponse> =>
    apiClient
      .post<RegistrarItemCuantitativoJuradoResponse>('/evaluaciones/items-cuantitativos-jurado', {
        nombre,
        descripcion,
        categoria: categoriaId,
        valor,
      })
      .then((r) => r.data),

  modificarItemCualitativoJurado: ({
    itemId,
    descripcion,
  }: ModificarItemCualitativoJuradoRequest): Promise<void> =>
    apiClient
      .patch<void>(`/evaluaciones/items-cualitativos-jurado/${itemId}`, { descripcion })
      .then(() => undefined),

  modificarItemCuantitativoJurado: ({
    itemId,
    descripcion,
  }: ModificarItemCuantitativoJuradoRequest): Promise<void> =>
    apiClient
      .patch<void>(`/evaluaciones/items-cuantitativos-jurado/${itemId}`, { descripcion })
      .then(() => undefined),
};
