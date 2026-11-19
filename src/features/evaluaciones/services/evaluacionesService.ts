import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import type { ConsultaCriteriaRequest, NodoFiltroDTO } from '../../../shared/models/query-criteria';
import type { EstadoEvaluacion } from '../models/EstadoEvaluacion';
import type { AsignarAsesorEvaluacionRequest } from '../models/AsignarAsesorEvaluacionRequest';
import type { AsignarJuradosEvaluacionRequest } from '../models/AsignarJuradosEvaluacionRequest';
import type { AsignarJuradosEvaluacionResponse } from '../models/AsignarJuradosEvaluacionResponse';
import type { Evaluacion } from '../models/Evaluacion';
import type { EvaluacionAsesor } from '../models/EvaluacionAsesor';
import type { EvaluacionAsesorRealizada } from '../models/EvaluacionAsesorRealizada';
import type { EvaluacionAsignadaAsesor } from '../models/EvaluacionAsignadaAsesor';
import type { EvaluacionAsignadaJurado } from '../models/EvaluacionAsignadaJurado';
import type { EvaluacionCualitativaAsesor } from '../models/EvaluacionCualitativaAsesor';
import type { EvaluacionCualitativaJurado } from '../models/EvaluacionCualitativaJurado';
import type { EvaluacionCuantitativaAsesor } from '../models/EvaluacionCuantitativaAsesor';
import type { EvaluacionCuantitativaJurado } from '../models/EvaluacionCuantitativaJurado';
import type { EvaluacionJurado } from '../models/EvaluacionJurado';
import type { JuradoVigente } from '../models/JuradoVigente';
import type { CambiarCriterioEvaluacionCualitativaAsesorRequest } from '../models/CambiarCriterioEvaluacionCualitativaAsesorRequest';
import type { CambiarCriterioEvaluacionCualitativaJuradoRequest } from '../models/CambiarCriterioEvaluacionCualitativaJuradoRequest';
import type { CambiarPuntajeEvaluacionCuantitativaAsesorRequest } from '../models/CambiarPuntajeEvaluacionCuantitativaAsesorRequest';
import type { CambiarPuntajeEvaluacionCuantitativaJuradoRequest } from '../models/CambiarPuntajeEvaluacionCuantitativaJuradoRequest';
import type { CategoriaItemCuantitativoJurado } from '../models/CategoriaItemCuantitativoJurado';
import type { CriterioItemCualitativoAsesor } from '../models/CriterioItemCualitativoAsesor';
import type { CriterioItemCualitativoJurado } from '../models/CriterioItemCualitativoJurado';
import type { ItemCualitativoAsesor } from '../models/ItemCualitativoAsesor';
import type { ItemCualitativoJurado } from '../models/ItemCualitativoJurado';
import type { ItemCuantitativoAsesor } from '../models/ItemCuantitativoAsesor';
import type { CategoriaItemCuantitativoAsesor } from '../models/CategoriaItemCuantitativoAsesor';
import type { RegistrarEvaluacionesCuantitativasAsesorRequest } from '../models/RegistrarEvaluacionesCuantitativasAsesorRequest';
import type { ItemCuantitativoJurado } from '../models/ItemCuantitativoJurado';
import type { OmitirEvaluacionesCuantitativasAsesorRequest } from '../models/OmitirEvaluacionesCuantitativasAsesorRequest';
import type { ModificarItemCualitativoJuradoRequest } from '../models/ModificarItemCualitativoJuradoRequest';
import type { ModificarItemCualitativoAsesorRequest } from '../models/ModificarItemCualitativoAsesorRequest';
import type { ModificarItemCuantitativoAsesorRequest } from '../models/ModificarItemCuantitativoAsesorRequest';
import type { ModificarItemCuantitativoJuradoRequest } from '../models/ModificarItemCuantitativoJuradoRequest';
import type { ModificarObservacionItemAsesorRequest } from '../models/ModificarObservacionItemAsesorRequest';
import type { ModificarObservacionItemJuradoRequest } from '../models/ModificarObservacionItemJuradoRequest';
import type { ObservacionItemAsesor } from '../models/ObservacionItemAsesor';
import type { ObservacionItemJurado } from '../models/ObservacionItemJurado';
import type { OmitirEvaluacionesCualitativasAsesorRequest } from '../models/OmitirEvaluacionesCualitativasAsesorRequest';
import type { OmitirEvaluacionesCualitativasJuradoRequest } from '../models/OmitirEvaluacionesCualitativasJuradoRequest';
import type { OmitirEvaluacionesCuantitativasJuradoRequest } from '../models/OmitirEvaluacionesCuantitativasJuradoRequest';
import type { RemoverJuradosEvaluacionRequest } from '../models/RemoverJuradosEvaluacionRequest';
import type { RegistrarEvaluacionesCualitativasAsesorRequest } from '../models/RegistrarEvaluacionesCualitativasAsesorRequest';
import type { RegistrarEvaluacionesCualitativasJuradoRequest } from '../models/RegistrarEvaluacionesCualitativasJuradoRequest';
import type { RegistrarEvaluacionesCuantitativasJuradoRequest } from '../models/RegistrarEvaluacionesCuantitativasJuradoRequest';
import type { RegistrarObservacionItemAsesorRequest } from '../models/RegistrarObservacionItemAsesorRequest';
import type { RegistrarObservacionItemAsesorResponse } from '../models/RegistrarObservacionItemAsesorResponse';
import type { RegistrarObservacionItemJuradoRequest } from '../models/RegistrarObservacionItemJuradoRequest';
import type { RegistrarObservacionItemJuradoResponse } from '../models/RegistrarObservacionItemJuradoResponse';
import type { RegistrarItemCualitativoAsesorRequest } from '../models/RegistrarItemCualitativoAsesorRequest';
import type { RegistrarItemCualitativoAsesorResponse } from '../models/RegistrarItemCualitativoAsesorResponse';
import type { RegistrarItemCualitativoJuradoRequest } from '../models/RegistrarItemCualitativoJuradoRequest';
import type { RegistrarItemCualitativoJuradoResponse } from '../models/RegistrarItemCualitativoJuradoResponse';
import type { RegistrarItemCuantitativoAsesorRequest } from '../models/RegistrarItemCuantitativoAsesorRequest';
import type { RegistrarItemCuantitativoAsesorResponse } from '../models/RegistrarItemCuantitativoAsesorResponse';
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
  getItemsCualitativosAsesor: (): Promise<ItemCualitativoAsesor[]> =>
    apiClient
      .get<ItemCualitativoAsesor[]>('/evaluaciones/items-cualitativos-asesor')
      .then((r) => r.data),

  registrarItemCualitativoAsesor: (
    req: RegistrarItemCualitativoAsesorRequest,
  ): Promise<RegistrarItemCualitativoAsesorResponse> =>
    apiClient
      .post<RegistrarItemCualitativoAsesorResponse>('/evaluaciones/items-cualitativos-asesor', req)
      .then((r) => r.data),

  modificarItemCualitativoAsesor: ({
    itemId,
    descripcion,
  }: ModificarItemCualitativoAsesorRequest): Promise<void> =>
    apiClient
      .patch<void>(`/evaluaciones/items-cualitativos-asesor/${itemId}`, { descripcion })
      .then(() => undefined),

  removerItemCualitativoAsesor: (itemId: string): Promise<void> =>
    apiClient
      .delete<void>(`/evaluaciones/items-cualitativos-asesor/${itemId}`)
      .then(() => undefined),

  getCriteriosItemCualitativoAsesor: (): Promise<CriterioItemCualitativoAsesor[]> =>
    apiClient
      .get<CriterioItemCualitativoAsesor[]>('/evaluaciones/criterios-item-cualitativo-asesor')
      .then((r) => r.data),

  registrarEvaluacionesCualitativasAsesor: ({
    evaluacionAsesorId,
    evaluaciones,
  }: RegistrarEvaluacionesCualitativasAsesorRequest): Promise<void> =>
    apiClient
      .post<void>(`/evaluaciones/evaluaciones-asesor/${evaluacionAsesorId}/cualitativas`, {
        evaluaciones: evaluaciones.map(({ itemId, criterioId }) => ({
          item: itemId,
          criterio: criterioId,
        })),
      })
      .then(() => undefined),

  registrarEvaluacionesCuantitativasAsesor: ({
    evaluacionAsesorId,
    evaluaciones,
  }: RegistrarEvaluacionesCuantitativasAsesorRequest): Promise<void> =>
    apiClient
      .post<void>(`/evaluaciones/evaluaciones-asesor/${evaluacionAsesorId}/cuantitativas`, {
        evaluaciones: evaluaciones.map(({ itemId, puntaje }) => ({ item: itemId, puntaje })),
      })
      .then(() => undefined),

  getItemsCuantitativosAsesor: (): Promise<ItemCuantitativoAsesor[]> =>
    apiClient
      .get<ItemCuantitativoAsesor[]>('/evaluaciones/items-cuantitativos-asesor')
      .then((r) => r.data),

  registrarItemCuantitativoAsesor: ({
    nombre,
    descripcion,
    categoriaId,
    valor,
  }: RegistrarItemCuantitativoAsesorRequest): Promise<RegistrarItemCuantitativoAsesorResponse> =>
    apiClient
      .post<RegistrarItemCuantitativoAsesorResponse>('/evaluaciones/items-cuantitativos-asesor', {
        nombre,
        descripcion,
        categoria: categoriaId,
        valor,
      })
      .then((r) => r.data),

  getCategoriasItemCuantitativoAsesor: (
    nombre?: string,
  ): Promise<CategoriaItemCuantitativoAsesor[]> =>
    apiClient
      .get<
        CategoriaItemCuantitativoAsesor[]
      >('/evaluaciones/categorias-item-cuantitativo-asesor', nombre ? { params: { nombre } } : undefined)
      .then((r) => r.data),

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

  cambiarCriterioEvaluacionCualitativaJurado: ({
    evaluacionCualitativaJuradoId,
    criterioId,
  }: CambiarCriterioEvaluacionCualitativaJuradoRequest): Promise<void> =>
    apiClient
      .patch<void>(
        `/evaluaciones/evaluaciones-cualitativas-jurado/${evaluacionCualitativaJuradoId}/criterio`,
        { criterio: criterioId },
      )
      .then(() => undefined),

  cambiarPuntajeEvaluacionCuantitativaJurado: ({
    evaluacionCuantitativaJuradoId,
    puntaje,
  }: CambiarPuntajeEvaluacionCuantitativaJuradoRequest): Promise<void> =>
    apiClient
      .patch<void>(
        `/evaluaciones/evaluaciones-cuantitativas-jurado/${evaluacionCuantitativaJuradoId}/puntaje`,
        { puntaje },
      )
      .then(() => undefined),

  cambiarPuntajeEvaluacionCuantitativaAsesor: ({
    evaluacionCuantitativaAsesorId,
    puntaje,
  }: CambiarPuntajeEvaluacionCuantitativaAsesorRequest): Promise<void> =>
    apiClient
      .patch<void>(
        `/evaluaciones/evaluaciones-cuantitativas-asesor/${evaluacionCuantitativaAsesorId}/puntaje`,
        { puntaje },
      )
      .then(() => undefined),

  cambiarCriterioEvaluacionCualitativaAsesor: ({
    evaluacionCualitativaAsesorId,
    criterioId,
  }: CambiarCriterioEvaluacionCualitativaAsesorRequest): Promise<void> =>
    apiClient
      .patch<void>(
        `/evaluaciones/evaluaciones-cualitativas-asesor/${evaluacionCualitativaAsesorId}/criterio`,
        { criterio: criterioId },
      )
      .then(() => undefined),

  removerItemCualitativoJurado: (itemId: string): Promise<void> =>
    apiClient
      .delete<void>(`/evaluaciones/items-cualitativos-jurado/${itemId}`)
      .then(() => undefined),

  modificarItemCuantitativoAsesor: ({
    itemId,
    descripcion,
  }: ModificarItemCuantitativoAsesorRequest): Promise<void> =>
    apiClient
      .patch<void>(`/evaluaciones/items-cuantitativos-asesor/${itemId}`, { descripcion })
      .then(() => undefined),

  removerItemCuantitativoAsesor: (itemId: string): Promise<void> =>
    apiClient
      .delete<void>(`/evaluaciones/items-cuantitativos-asesor/${itemId}`)
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

  getEvaluacionesAsignadasAsesor: (
    req: ConsultaCriteriaRequest,
  ): Promise<Page<EvaluacionAsignadaAsesor>> =>
    apiClient
      .post<Page<EvaluacionAsignadaAsesor>>('/evaluaciones/evaluaciones-asesor/asesor', req)
      .then((r) => r.data),

  getEvaluacionesCualitativasAsesor: (
    evaluacionAsesorId: string,
  ): Promise<EvaluacionCualitativaAsesor[]> =>
    apiClient
      .get<
        EvaluacionCualitativaAsesor[]
      >(`/evaluaciones/evaluaciones-asesor/${evaluacionAsesorId}/cualitativas`)
      .then((r) => r.data),

  getEvaluacionesCuantitativasAsesor: (
    evaluacionAsesorId: string,
  ): Promise<EvaluacionCuantitativaAsesor[]> =>
    apiClient
      .get<
        EvaluacionCuantitativaAsesor[]
      >(`/evaluaciones/evaluaciones-asesor/${evaluacionAsesorId}/cuantitativas`)
      .then((r) => r.data),

  getEvaluacionesCuantitativasAsesorEstudiante: (
    evaluacionAsesorId: string,
  ): Promise<EvaluacionCuantitativaAsesor[]> =>
    apiClient
      .get<
        EvaluacionCuantitativaAsesor[]
      >(`/evaluaciones/evaluaciones-asesor/${evaluacionAsesorId}/cuantitativas/estudiante`)
      .then((r) => r.data),

  getEvaluacionesCualitativasAsesorEstudiante: (
    evaluacionAsesorId: string,
  ): Promise<EvaluacionCualitativaAsesor[]> =>
    apiClient
      .get<
        EvaluacionCualitativaAsesor[]
      >(`/evaluaciones/evaluaciones-asesor/${evaluacionAsesorId}/cualitativas/estudiante`)
      .then((r) => r.data),

  getJuradosEvaluacion: (
    evaluacionId: string,
    req: ConsultaCriteriaRequest,
  ): Promise<Page<EvaluacionJurado>> =>
    apiClient
      .post<Page<EvaluacionJurado>>(`/evaluaciones/${evaluacionId}/evaluaciones-jurado`, req)
      .then((r) => r.data),

  getEvaluacionAsesor: (evaluacionId: string): Promise<EvaluacionAsesor> =>
    apiClient
      .get<EvaluacionAsesor>(`/evaluaciones/${evaluacionId}/evaluacion-asesor`)
      .then((r) => r.data),

  getEvaluacionAsesorRealizada: (evaluacionAsesorId: string): Promise<EvaluacionAsesorRealizada> =>
    apiClient
      .get<EvaluacionAsesorRealizada>(`/evaluaciones/evaluaciones-asesor/${evaluacionAsesorId}`)
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

  getEvaluacionesCuantitativasRealizadasJurado: (
    evaluacionJuradoId: string,
  ): Promise<EvaluacionCuantitativaJurado[]> =>
    apiClient
      .get<
        EvaluacionCuantitativaJurado[]
      >(`/evaluaciones/evaluaciones-jurado/${evaluacionJuradoId}/cuantitativas/jurado`)
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

  asignarAsesorEvaluacion: ({
    evaluacionId,
    asesorId,
  }: AsignarAsesorEvaluacionRequest): Promise<void> =>
    apiClient
      .patch<void>(`/evaluaciones/${evaluacionId}/asesor`, { asesor: asesorId })
      .then(() => undefined),

  removerJuradosEvaluacion: ({
    evaluacionId,
    juradosIds,
  }: RemoverJuradosEvaluacionRequest): Promise<void> =>
    apiClient
      .delete<void>(`/evaluaciones/${evaluacionId}/jurados`, { data: { jurados: juradosIds } })
      .then(() => undefined),

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

  registrarEvaluacionesCuantitativasJurado: ({
    evaluacionJuradoId,
    evaluaciones,
  }: RegistrarEvaluacionesCuantitativasJuradoRequest): Promise<void> =>
    apiClient
      .post<void>(`/evaluaciones/evaluaciones-jurado/${evaluacionJuradoId}/cuantitativas`, {
        evaluaciones: evaluaciones.map(({ itemId, puntaje }) => ({ item: itemId, puntaje })),
      })
      .then(() => undefined),

  registrarObservacionItemJurado: ({
    evaluacionCuantitativaJuradoId,
    descripcion,
  }: RegistrarObservacionItemJuradoRequest): Promise<RegistrarObservacionItemJuradoResponse> =>
    apiClient
      .post<RegistrarObservacionItemJuradoResponse>(
        `/evaluaciones/evaluaciones-cuantitativas-jurado/${evaluacionCuantitativaJuradoId}/observaciones`,
        { descripcion },
      )
      .then((r) => r.data),

  getObservacionesEvaluacionCuantitativaJurado: (
    evaluacionCuantitativaJuradoId: string,
    req: ConsultaCriteriaRequest,
  ): Promise<Page<ObservacionItemJurado>> =>
    apiClient
      .post<
        Page<ObservacionItemJurado>
      >(`/evaluaciones/evaluaciones-cuantitativas-jurado/${evaluacionCuantitativaJuradoId}/observaciones/jurado`, req)
      .then((r) => r.data),

  getObservacionesEvaluacionCuantitativaJuradoEstudiante: (
    evaluacionCuantitativaJuradoId: string,
    req: ConsultaCriteriaRequest,
  ): Promise<Page<ObservacionItemJurado>> =>
    apiClient
      .post<
        Page<ObservacionItemJurado>
      >(`/evaluaciones/evaluaciones-cuantitativas-jurado/${evaluacionCuantitativaJuradoId}/observaciones/estudiante`, req)
      .then((r) => r.data),

  getObservacionesEvaluacionCuantitativaAsesor: (
    evaluacionCuantitativaAsesorId: string,
    req: ConsultaCriteriaRequest,
  ): Promise<Page<ObservacionItemAsesor>> =>
    apiClient
      .post<
        Page<ObservacionItemAsesor>
      >(`/evaluaciones/evaluaciones-cuantitativas-asesor/${evaluacionCuantitativaAsesorId}/observaciones/asesor`, req)
      .then((r) => r.data),

  registrarObservacionItemAsesor: ({
    evaluacionCuantitativaAsesorId,
    descripcion,
  }: RegistrarObservacionItemAsesorRequest): Promise<RegistrarObservacionItemAsesorResponse> =>
    apiClient
      .post<RegistrarObservacionItemAsesorResponse>(
        `/evaluaciones/evaluaciones-cuantitativas-asesor/${evaluacionCuantitativaAsesorId}/observaciones`,
        { descripcion },
      )
      .then((r) => r.data),

  modificarObservacionItemAsesor: ({
    observacionId,
    descripcion,
  }: ModificarObservacionItemAsesorRequest): Promise<void> =>
    apiClient
      .patch<void>(`/evaluaciones/observaciones-item-asesor/${observacionId}`, { descripcion })
      .then(() => undefined),

  removerObservacionItemAsesor: (observacionId: string): Promise<void> =>
    apiClient
      .delete<void>(`/evaluaciones/observaciones-item-asesor/${observacionId}`)
      .then(() => undefined),

  modificarObservacionItemJurado: ({
    observacionId,
    descripcion,
  }: ModificarObservacionItemJuradoRequest): Promise<void> =>
    apiClient
      .patch<void>(`/evaluaciones/observaciones-item-jurado/${observacionId}`, { descripcion })
      .then(() => undefined),

  removerObservacionItemJurado: (observacionId: string): Promise<void> =>
    apiClient
      .delete<void>(`/evaluaciones/observaciones-item-jurado/${observacionId}`)
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

  omitirEvaluacionesCualitativasAsesor: ({
    evaluacionAsesorId,
    items,
  }: OmitirEvaluacionesCualitativasAsesorRequest): Promise<void> => {
    const params = new URLSearchParams();
    items.forEach((item) => params.append('item', item));
    return apiClient
      .delete<void>(`/evaluaciones/evaluaciones-asesor/${evaluacionAsesorId}/cualitativas`, {
        params,
      })
      .then(() => undefined);
  },

  omitirEvaluacionesCuantitativasJurado: ({
    evaluacionJuradoId,
    evaluaciones,
  }: OmitirEvaluacionesCuantitativasJuradoRequest): Promise<void> =>
    apiClient
      .delete<void>(`/evaluaciones/evaluaciones-jurado/${evaluacionJuradoId}/cuantitativas`, {
        data: { evaluaciones },
      })
      .then(() => undefined),

  omitirEvaluacionesCuantitativasAsesor: ({
    evaluacionAsesorId,
    items,
  }: OmitirEvaluacionesCuantitativasAsesorRequest): Promise<void> => {
    const params = new URLSearchParams();
    items.forEach((item) => params.append('item', item));
    return apiClient
      .delete<void>(`/evaluaciones/evaluaciones-asesor/${evaluacionAsesorId}/cuantitativas`, {
        params,
      })
      .then(() => undefined);
  },
};
