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
  EstadoEvaluacion,
  CrearItemRequest,
  ItemCreadoResponse,
  ModificarItemRequest,
  CrearEvaluacionFichaPerfilRequest,
  EvaluacionCreadaResponse,
  EvaluacionFichaPerfil,
  AgregarEstadoEvaluacionRequest,
  EstadoEvaluacionFicha,
} from '../models/fichas-perfil';

// ─── Alineados con el backend expuesto ───

export const fichasPerfilService = {
  registrarFichaPerfil: (req: RegistrarFichaPerfilRequest): Promise<FichaPerfilCreadaResponse> =>
    apiClient
      .post<FichaPerfilCreadaResponse>('/fichas-perfil', req)
      .then((r) => r.data),

  modificarTituloFichaPerfil: (req: ModificarFichaPerfilRequest): Promise<void> =>
    apiClient
      .patch(`/fichas-perfil/${req.fichaPerfilId}`, { tituloProyecto: req.tituloProyecto })
      .then(() => undefined),

  cambiarAsesor: (req: CambiarAsesorRequest): Promise<void> =>
    apiClient
      .patch(`/fichas-perfil/${req.idFicha}/asesor-ficha`, { asesorFichaId: req.idAsesorFicha })
      .then(() => undefined),

  getFichasCoordinador: (page = 0, size = 10): Promise<Page<FichaPerfil>> =>
    apiClient
      .post<Page<FichaPerfil>>('/fichas-perfil/coordinador', { pagina: page, tamanio: size })
      .then((r) => r.data),

  agregarItemFichaPerfil: (req: CrearItemRequest): Promise<ItemCreadoResponse> =>
    apiClient
      .post<ItemCreadoResponse>(`/fichas-perfil/${req.fichaPerfilId}/items`, {
        tipoItem: req.tipoItemId,
        contenido: req.contenido,
      })
      .then((r) => r.data),

  modificarItem: (req: ModificarItemRequest): Promise<void> =>
    apiClient
      .patch(`/fichas-perfil/${req.itemId}/items`, { contenido: req.contenido })
      .then(() => undefined),

  registrarEvaluacion: (req: CrearEvaluacionFichaPerfilRequest): Promise<EvaluacionCreadaResponse> =>
    apiClient
      .post<EvaluacionCreadaResponse>(`/fichas-perfil/${req.fichaPerfilId}/evaluaciones`)
      .then((r) => r.data),

  agregarEstadoEvaluacion: (req: AgregarEstadoEvaluacionRequest): Promise<EstadoEvaluacionFicha> =>
    apiClient
      .post<EstadoEvaluacionFicha>('/fichas-perfil/estado-evaluacion-ficha', req)
      .then((r) => r.data),

  getEstadosFicha: (): Promise<EstadoFicha[]> =>
    apiClient
      .get<EstadoFicha[]>('/fichas-perfil/estados-ficha')
      .then((r) => r.data),

  // ─── Pendientes: el backend aún no expone estos endpoints ───

  // Pendiente: sin endpoint en el backend.
  getMiFichaPerfil: (estudianteId: string): Promise<MiFichaPerfilResponse> =>
    apiClient
      .get<MiFichaPerfilResponse>(`/fichas-perfil/estudiante/${estudianteId}/mi-ficha`)
      .then((r) => r.data),

  // Pendiente: sin endpoint en el backend.
  consultarItemsMiFichaPerfil: (estudianteId: string): Promise<Item[]> =>
    apiClient
      .get<Item[]>('/fichas-perfil/estudiante/mi-ficha/items', { params: { estudianteId } })
      .then((r) => r.data),

  // Pendiente: sin endpoint en el backend.
  removerItem: (itemId: string): Promise<void> =>
    apiClient
      .delete(`/fichas-perfil/estudiante/mi-ficha/items/${itemId}`)
      .then(() => undefined),

  // Pendiente: sin endpoint en el backend.
  consultarTodosTipoItem: (): Promise<TipoItem[]> =>
    apiClient
      .get<TipoItem[]>('/fichas-perfil/tipos-item')
      .then((r) => r.data),

  // Pendiente: sin endpoint en el backend.
  consultarAsesoresDisponibles: (): Promise<Asesor[]> =>
    apiClient
      .get<Asesor[]>('/fichas-perfil/asesores')
      .then((r) => r.data),

  // Pendiente: sin endpoint en el backend.
  consultarEstudiantesDisponibles: (): Promise<Estudiante[]> =>
    apiClient
      .get<Estudiante[]>('/fichas-perfil/estudiantes')
      .then((r) => r.data),

  // Pendiente: el backend expone asignación por lista bajo /{fichaPerfilId}/estudiantes; el flujo
  // por vínculo individual requiere rediseño coordinado con la lectura de vinculados.
  consultarEstudiantesVinculados: (idFichaPerfil: string): Promise<EstudianteVinculado[]> =>
    apiClient
      .get<EstudianteVinculado[]>(`/fichas-perfil/${idFichaPerfil}/estudiantes`)
      .then((r) => r.data),

  // Pendiente: el backend recibe { estudiantesIds } y responde 204; el flujo por vínculo requiere rediseño.
  asignarEstudiante: (req: AsignarEstudianteRequest): Promise<AsignarEstudianteResponse> =>
    apiClient
      .post<AsignarEstudianteResponse>('/fichas-perfil/estudiantes', req)
      .then((r) => r.data),

  // Pendiente: el backend elimina por /{fichaPerfilId}/estudiantes/{estudianteId}; el flujo por vínculo requiere rediseño.
  removerEstudiante: (idVinculo: string): Promise<void> =>
    apiClient
      .delete(`/fichas-perfil/estudiantes/${idVinculo}`)
      .then(() => undefined),

  // Pendiente: sin endpoint en el backend.
  getFichasAsesor: (asesorId: string, page = 0, size = 10): Promise<Page<FichaPerfilAsesor>> =>
    apiClient
      .get<Page<FichaPerfilAsesor>>('/fichas-perfil/asesor-ficha', { params: { asesorId, page, size } })
      .then((r) => r.data),

  // Pendiente: sin endpoint en el backend.
  getFichasRepresentante: (representanteId: string, page = 0, size = 10): Promise<Page<FichaPerfilRepresentante>> =>
    apiClient
      .get<Page<FichaPerfilRepresentante>>('/fichas-perfil/representante', { params: { representanteId, page, size } })
      .then((r) => r.data),

  // Pendiente: sin endpoint en el backend.
  getItemsFichaAsesor: (fichaPerfilId: string): Promise<Item[]> =>
    apiClient
      .get<Item[]>('/fichas-perfil/asesor-items', { params: { fichaPerfilId } })
      .then((r) => r.data),

  // Pendiente: sin endpoint en el backend.
  getItemsFichaRepresentante: (fichaPerfilId: string): Promise<Item[]> =>
    apiClient
      .get<Item[]>('/fichas-perfil/representante-items', { params: { fichaPerfilId } })
      .then((r) => r.data),

  // Pendiente: sin endpoint en el backend.
  getEvaluacionFicha: (fichaPerfilId: string): Promise<EvaluacionFichaPerfil> =>
    apiClient
      .get<EvaluacionFichaPerfil>('/fichas-perfil/representante/evaluacion', { params: { fichaPerfilId } })
      .then((r) => r.data),

  // Pendiente: sin endpoint en el backend.
  getEstadosEvaluacion: (): Promise<EstadoEvaluacion[]> =>
    apiClient
      .get<EstadoEvaluacion[]>('/fichas-perfil/estados-evaluacion')
      .then((r) => r.data),

  // Pendiente: sin endpoint en el backend.
  agregarEstadoFichaPerfil: (req: AgregarEstadoFichaPerfilRequest): Promise<EstadoFichaPerfil> =>
    apiClient
      .post<EstadoFichaPerfil>('/fichas-perfil/estados', req)
      .then((r) => r.data),
};
