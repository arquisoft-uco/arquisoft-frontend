import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import type { ConsultaCriteriaRequest, NodoFiltroDTO } from '../../../shared/models/query-criteria';
import type { EstadoEvaluacion } from '../models/EstadoEvaluacion';
import type { AsignarJuradosEvaluacionRequest } from '../models/AsignarJuradosEvaluacionRequest';
import type { AsignarJuradosEvaluacionResponse } from '../models/AsignarJuradosEvaluacionResponse';
import type { Evaluacion } from '../models/Evaluacion';
import type { EvaluacionAsignadaJurado } from '../models/EvaluacionAsignadaJurado';
import type { EvaluacionCualitativaJurado } from '../models/EvaluacionCualitativaJurado';
import type { EvaluacionCuantitativaJurado } from '../models/EvaluacionCuantitativaJurado';
import type { EvaluacionJurado } from '../models/EvaluacionJurado';
import type { JuradoVigente } from '../models/JuradoVigente';
import type { CategoriaItemCuantitativoJurado } from '../models/CategoriaItemCuantitativoJurado';
import type { CriterioItemCualitativoJurado } from '../models/CriterioItemCualitativoJurado';
import type { ItemCualitativoJurado } from '../models/ItemCualitativoJurado';
import type { ItemCuantitativoJurado } from '../models/ItemCuantitativoJurado';
import type { ModificarItemCualitativoJuradoRequest } from '../models/ModificarItemCualitativoJuradoRequest';
import type { ModificarItemCuantitativoJuradoRequest } from '../models/ModificarItemCuantitativoJuradoRequest';
import type { OmitirEvaluacionesCualitativasJuradoRequest } from '../models/OmitirEvaluacionesCualitativasJuradoRequest';
import type { RegistrarEvaluacionesCualitativasJuradoRequest } from '../models/RegistrarEvaluacionesCualitativasJuradoRequest';
import type { RegistrarItemCualitativoJuradoRequest } from '../models/RegistrarItemCualitativoJuradoRequest';
import type { RegistrarItemCualitativoJuradoResponse } from '../models/RegistrarItemCualitativoJuradoResponse';
import type { RegistrarItemCuantitativoJuradoRequest } from '../models/RegistrarItemCuantitativoJuradoRequest';
import type { RegistrarItemCuantitativoJuradoResponse } from '../models/RegistrarItemCuantitativoJuradoResponse';

interface JuradoVigenteResponseDTO {
  id: string;
  identificador: string;
  nombre: string;
  email: string;
  contacto: string;
  estado: string;
}

export const TAMANIO_PAGINA_JURADOS = 10;

function construirFiltrosJurados(texto: string): NodoFiltroDTO {
  const estadoActivo: NodoFiltroDTO = {
    tipo: 'PREDICADO',
    campo: 'estado',
    operador: 'ES',
    valor: 'ACTIVO',
  };
  const recortado = texto.trim();
  if (!recortado) return estadoActivo;
  return {
    tipo: 'GRUPO',
    conector: 'AND',
    nodos: [
      estadoActivo,
      { tipo: 'PREDICADO', campo: 'nombre', operador: 'CONTIENE', valor: recortado },
    ],
  };
}

export const evaluacionesService = {
  getItemsCualitativosJurado: (): Promise<ItemCualitativoJurado[]> =>
    apiClient
      .get<ItemCualitativoJurado[]>('/evaluaciones/items-cualitativos-jurado')
      .then((r) => r.data),

  getItemsCuantitativosJurado: (): Promise<ItemCuantitativoJurado[]> =>
    apiClient
      .get<ItemCuantitativoJurado[]>('/evaluaciones/items-cuantitativos-jurado')
      .then((r) => r.data),

  getCategoriasItemCuantitativoJurado: (
    nombre?: string,
  ): Promise<CategoriaItemCuantitativoJurado[]> =>
    apiClient
      .get<
        CategoriaItemCuantitativoJurado[]
      >('/evaluaciones/categorias-item-cuantitativo-jurado', nombre ? { params: { nombre } } : undefined)
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

  removerItemCualitativoJurado: (itemId: string): Promise<void> =>
    apiClient
      .delete<void>(`/evaluaciones/items-cualitativos-jurado/${itemId}`)
      .then(() => undefined),

  modificarItemCuantitativoJurado: ({
    itemId,
    descripcion,
  }: ModificarItemCuantitativoJuradoRequest): Promise<void> =>
    apiClient
      .patch<void>(`/evaluaciones/items-cuantitativos-jurado/${itemId}`, { descripcion })
      .then(() => undefined),

  removerItemCuantitativoJurado: (itemId: string): Promise<void> =>
    apiClient
      .delete<void>(`/evaluaciones/items-cuantitativos-jurado/${itemId}`)
      .then(() => undefined),

  getEvaluacionesCoordinador: (req: ConsultaCriteriaRequest): Promise<Page<Evaluacion>> =>
    apiClient.post<Page<Evaluacion>>('/evaluaciones/coordinador', req).then((r) => r.data),

  getEvaluacionesEstudiante: (req: ConsultaCriteriaRequest): Promise<Page<Evaluacion>> =>
    apiClient.post<Page<Evaluacion>>('/evaluaciones/estudiante', req).then((r) => r.data),

  getJuradosEvaluacion: (
    evaluacionId: string,
    req: ConsultaCriteriaRequest,
  ): Promise<Page<EvaluacionJurado>> =>
    apiClient
      .post<Page<EvaluacionJurado>>(`/evaluaciones/${evaluacionId}/evaluaciones-jurado`, req)
      .then((r) => r.data),

  getEvaluacionesCualitativasJurado: (
    evaluacionJuradoId: string,
  ): Promise<EvaluacionCualitativaJurado[]> =>
    apiClient
      .get<
        EvaluacionCualitativaJurado[]
      >(`/evaluaciones/evaluaciones-jurado/${evaluacionJuradoId}/cualitativas`)
      .then((r) => r.data),

  getEvaluacionesCualitativasRealizadasJurado: (
    evaluacionJuradoId: string,
  ): Promise<EvaluacionCualitativaJurado[]> =>
    apiClient
      .get<
        EvaluacionCualitativaJurado[]
      >(`/evaluaciones/evaluaciones-jurado/${evaluacionJuradoId}/cualitativas/jurado`)
      .then((r) => r.data),

  getEvaluacionesCuantitativasJurado: (
    evaluacionJuradoId: string,
  ): Promise<EvaluacionCuantitativaJurado[]> =>
    apiClient
      .get<
        EvaluacionCuantitativaJurado[]
      >(`/evaluaciones/evaluaciones-jurado/${evaluacionJuradoId}/cuantitativas`)
      .then((r) => r.data),

  getEvaluacionesAsignadasJurado: (
    req: ConsultaCriteriaRequest,
  ): Promise<Page<EvaluacionAsignadaJurado>> =>
    apiClient
      .post<Page<EvaluacionAsignadaJurado>>('/evaluaciones/evaluaciones-jurado/jurado', req)
      .then((r) => r.data),

  getEstadosEvaluacion: (): Promise<EstadoEvaluacion[]> =>
    apiClient.get<EstadoEvaluacion[]>('/evaluaciones/estados-evaluacion').then((r) => r.data),

  getJuradosVigentes: ({
    pagina,
    texto,
  }: {
    pagina: number;
    texto: string;
  }): Promise<Page<JuradoVigente>> =>
    apiClient
      .post<Page<JuradoVigenteResponseDTO>>('/usuarios/jurados/vigentes', {
        pagina,
        tamanio: TAMANIO_PAGINA_JURADOS,
        ordenamiento: ['nombre:ASC'],
        filtros: construirFiltrosJurados(texto),
      })
      .then((r) => ({
        ...r.data,
        content: r.data.content.map((dto) => ({
          id: dto.id,
          nombre: dto.nombre,
          email: dto.email,
        })),
      })),

  asignarJuradosEvaluacion: ({
    evaluacionId,
    juradosIds,
  }: AsignarJuradosEvaluacionRequest): Promise<AsignarJuradosEvaluacionResponse> =>
    apiClient
      .post<AsignarJuradosEvaluacionResponse>(`/evaluaciones/${evaluacionId}/jurados`, {
        jurados: juradosIds,
      })
      .then((r) => r.data),

  registrarEvaluacionesCualitativasJurado: ({
    evaluacionJuradoId,
    evaluaciones,
  }: RegistrarEvaluacionesCualitativasJuradoRequest): Promise<void> =>
    apiClient
      .post<void>(`/evaluaciones-jurado/${evaluacionJuradoId}/evaluaciones-cualitativas`, {
        evaluaciones: evaluaciones.map(({ itemId, criterioId }) => ({
          item: itemId,
          criterio: criterioId,
        })),
      })
      .then(() => undefined),

  omitirEvaluacionesCualitativasJurado: ({
    evaluacionJuradoId,
    evaluaciones,
  }: OmitirEvaluacionesCualitativasJuradoRequest): Promise<void> =>
    apiClient
      .delete<void>(`/evaluaciones/evaluaciones-jurado/${evaluacionJuradoId}/cualitativas`, {
        data: { evaluaciones },
      })
      .then(() => undefined),
};
