import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import type { Asesor } from '../models/Asesor';
import type { AsignarEstudianteRequest } from '../models/AsignarEstudianteRequest';
import type { AsignarEstudianteResponse } from '../models/AsignarEstudianteResponse';
import type { CambiarAsesorRequest } from '../models/CambiarAsesorRequest';
import type { Estudiante } from '../models/Estudiante';
import type { EstudianteVinculado } from '../models/EstudianteVinculado';
import type { FichaPerfilCreadaResponse } from '../models/FichaPerfilCreadaResponse';
import type { FichaPerfil } from '../models/FichaPerfil';
import type { FichaPerfilAsesor } from '../models/FichaPerfilAsesor';
import type { FichaPerfilRepresentante } from '../models/FichaPerfilRepresentante';
import type { EstadoFichaPerfil, AgregarEstadoFichaPerfilRequest } from '../models/EstadoFichaPerfil';
import type { RegistrarFichaPerfilRequest } from '../models/RegistrarFichaPerfilRequest';
import type { MiFichaPerfilResponse } from '../models/MiFichaPerfilResponse';
import type { ModificarFichaPerfilRequest } from '../models/ModificarFichaPerfilRequest';
import type {
  Item,
  TipoItem,
  EstadoFicha,
  CrearItemRequest,
  ItemCreadoResponse,
  ModificarItemRequest,
  CrearEvaluacionFichaPerfilRequest,
  EvaluacionCreadaResponse,
  EvaluacionFichaPerfil,
} from '../models/fichas-perfil';

export const fichasPerfilService = {
  getMiFichaPerfil: (estudianteId: string): Promise<MiFichaPerfilResponse> =>
    apiClient
      .get<MiFichaPerfilResponse>(`/fichas-perfil/estudiante/${estudianteId}/mi-ficha`)
      .then((r) => r.data),

  modificarTituloFichaPerfil: (req: ModificarFichaPerfilRequest): Promise<void> =>
    apiClient
      .put('/fichas-perfil/estudiante/mi-ficha', req)
      .then(() => undefined),

  consultarItemsMiFichaPerfil: (estudianteId: string): Promise<Item[]> =>
    apiClient
      .get<Item[]>('/fichas-perfil/estudiante/mi-ficha/items', { params: { estudianteId } })
      .then((r) => r.data),

  agregarItemFichaPerfil: (req: CrearItemRequest): Promise<ItemCreadoResponse> =>
    apiClient
      .post<ItemCreadoResponse>('/fichas-perfil/estudiante/mi-ficha/items', req)
      .then((r) => r.data),

  modificarItem: (req: ModificarItemRequest): Promise<void> =>
    apiClient
      .put('/fichas-perfil/estudiante/mi-ficha/items', req)
      .then(() => undefined),

  removerItem: (itemId: string): Promise<void> =>
    apiClient
      .delete(`/fichas-perfil/estudiante/mi-ficha/items/${itemId}`)
      .then(() => undefined),

  consultarTodosTipoItem: (): Promise<TipoItem[]> =>
    apiClient
      .get<TipoItem[]>('/fichas-perfil/tipos-item')
      .then((r) => r.data),

  getFichasCoordinador: (page = 0, size = 10): Promise<Page<FichaPerfil>> =>
    apiClient
      .get<Page<FichaPerfil>>('/fichas-perfil/coordinador', { params: { page, size } })
      .then((r) => r.data),

  consultarAsesoresDisponibles: (): Promise<Asesor[]> =>
    apiClient
      .get<Asesor[]>('/fichas-perfil/asesores')
      .then((r) => r.data),

  consultarEstudiantesDisponibles: (): Promise<Estudiante[]> =>
    apiClient
      .get<Estudiante[]>('/fichas-perfil/estudiantes')
      .then((r) => r.data),

  registrarFichaPerfil: (req: RegistrarFichaPerfilRequest): Promise<FichaPerfilCreadaResponse> =>
    apiClient
      .post<FichaPerfilCreadaResponse>('/fichas-perfil', req)
      .then((r) => r.data),

  consultarEstudiantesVinculados: (idFichaPerfil: string): Promise<EstudianteVinculado[]> =>
    apiClient
      .get<EstudianteVinculado[]>(`/fichas-perfil/${idFichaPerfil}/estudiantes`)
      .then((r) => r.data),

  asignarEstudiante: (req: AsignarEstudianteRequest): Promise<AsignarEstudianteResponse> =>
    apiClient
      .post<AsignarEstudianteResponse>('/fichas-perfil/estudiantes', req)
      .then((r) => r.data),

  removerEstudiante: (idVinculo: string): Promise<void> =>
    apiClient
      .delete(`/fichas-perfil/estudiantes/${idVinculo}`)
      .then(() => undefined),

  cambiarAsesor: (req: CambiarAsesorRequest): Promise<void> =>
    apiClient
      .put('/fichas-perfil/asesor', req)
      .then(() => undefined),

  // ─── Asesor Ficha ───

  getFichasAsesor: (asesorId: string, page = 0, size = 10): Promise<Page<FichaPerfilAsesor>> =>
    apiClient
      .get<Page<FichaPerfilAsesor>>('/fichas-perfil/asesor-ficha', { params: { asesorId, page, size } })
      .then((r) => r.data),

  getFichasRepresentante: (representanteId: string, page = 0, size = 10): Promise<Page<FichaPerfilRepresentante>> =>
    apiClient
      .get<Page<FichaPerfilRepresentante>>('/fichas-perfil/representante', { params: { representanteId, page, size } })
      .then((r) => r.data),

  getItemsFichaAsesor: (fichaPerfilId: string): Promise<Item[]> =>
    apiClient
      .get<Item[]>('/fichas-perfil/asesor-items', { params: { fichaPerfilId } })
      .then((r) => r.data),

  getItemsFichaRepresentante: (fichaPerfilId: string): Promise<Item[]> =>
    apiClient
      .get<Item[]>('/fichas-perfil/representante-items', { params: { fichaPerfilId } })
      .then((r) => r.data),

  registrarEvaluacion: (req: CrearEvaluacionFichaPerfilRequest): Promise<EvaluacionCreadaResponse> =>
    apiClient
      .post<EvaluacionCreadaResponse>('/fichas-perfil/representante/evaluaciones-ficha-perfil', req)
      .then((r) => r.data),

  getEvaluacionFicha: (fichaPerfilId: string): Promise<EvaluacionFichaPerfil> =>
    apiClient
      .get<EvaluacionFichaPerfil>('/fichas-perfil/representante/evaluacion', { params: { fichaPerfilId } })
      .then((r) => r.data),

  // ─── Catálogo de estados ───

  getEstadosFicha: (): Promise<EstadoFicha[]> =>
    apiClient
      .get<EstadoFicha[]>('/fichas-perfil/estados-ficha')
      .then((r) => r.data),

  agregarEstadoFichaPerfil: (req: AgregarEstadoFichaPerfilRequest): Promise<EstadoFichaPerfil> =>
    apiClient
      .post<EstadoFichaPerfil>('/fichas-perfil/estados', req)
      .then((r) => r.data),
};
