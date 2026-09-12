import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import type { Asesor } from '../models/Asesor';
import type { AsignarEstudianteRequest } from '../models/AsignarEstudianteRequest';
import type { CambiarAsesorRequest } from '../models/CambiarAsesorRequest';
import type { Estudiante } from '../models/Estudiante';
import type { EstudianteVinculado } from '../models/EstudianteVinculado';
import type { FichaPerfilCreadaResponse } from '../models/FichaPerfilCreadaResponse';
import type { FichaPerfil } from '../models/FichaPerfil';
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

// Forma cruda de la respuesta del backend para GET /fichas-perfil/{id}/estudiantes;
// se traduce a EstudianteVinculado (idVinculo/id) en consultarEstudiantesVinculados.
interface EstudianteFichaPerfilResponseDTO {
  id: string;
  fichaPerfilId: string;
  estudianteId: string;
  nombre: string;
  email: string;
}

// Forma cruda de ItemFichaPerfilResponseDTO (tipoItem/tipoItemNombre planos);
// se traduce al Item del frontend (tipoItem anidado) en los métodos de consulta de ítems.
interface ItemFichaPerfilResponseDTO {
  id: string;
  fichaPerfilId: string;
  tipoItem: string;
  tipoItemNombre: string;
  contenido: string;
}

function toItem(dto: ItemFichaPerfilResponseDTO): Item {
  return {
    id: dto.id,
    fichaPerfilId: dto.fichaPerfilId,
    contenido: dto.contenido,
    tipoItem: { id: dto.tipoItem, nombre: dto.tipoItemNombre },
  };
}

// Forma cruda de EvaluacionFichaPerfilResponseDTO (estadoEvaluacion/estadoEvaluacionNombre
// pueden venir null cuando la evaluación no tiene filas de estado aún).
interface EvaluacionFichaPerfilResponseDTO {
  id: string;
  fichaPerfilId: string;
  fechaCreacion: string;
  estadoEvaluacion: string | null;
  estadoEvaluacionNombre: string | null;
}

// ─── Alineados con el backend expuesto ───

export const fichasPerfilService = {
  registrarFichaPerfil: (req: RegistrarFichaPerfilRequest): Promise<FichaPerfilCreadaResponse> =>
    apiClient
      .post<FichaPerfilCreadaResponse>('/fichas-perfil', {
        tituloProyecto: req.tituloProyecto,
        asesorFicha: req.asesorFichaId,
        estudiantes: req.estudiantesIds,
      })
      .then((r) => r.data),

  modificarTituloFichaPerfil: (req: ModificarFichaPerfilRequest): Promise<void> =>
    apiClient
      .patch(`/fichas-perfil/${req.fichaPerfilId}`, { tituloProyecto: req.tituloProyecto })
      .then(() => undefined),

  cambiarAsesor: (req: CambiarAsesorRequest): Promise<void> =>
    apiClient
      .patch(`/fichas-perfil/${req.idFicha}/asesor-ficha`, { asesorFicha: req.idAsesorFicha })
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
      .patch(`/fichas-perfil/items/${req.itemId}`, { contenido: req.contenido })
      .then(() => undefined),

  registrarEvaluacion: (req: CrearEvaluacionFichaPerfilRequest): Promise<EvaluacionCreadaResponse> =>
    apiClient
      .post<EvaluacionCreadaResponse>(`/fichas-perfil/${req.fichaPerfilId}/evaluaciones`)
      .then((r) => r.data),

  agregarEstadoEvaluacion: (req: AgregarEstadoEvaluacionRequest): Promise<EstadoEvaluacionFicha> =>
    apiClient
      .post<EstadoEvaluacionFicha>('/fichas-perfil/estado-evaluacion-ficha', {
        evaluacionFichaPerfil: req.evaluacionFichaPerfilId,
        estadoEvaluacion: req.estadoEvaluacionId,
      })
      .then((r) => r.data),

  getEstadosFicha: (): Promise<EstadoFicha[]> =>
    apiClient
      .get<EstadoFicha[]>('/fichas-perfil/estados-ficha')
      .then((r) => r.data),

  removerItem: (itemId: string): Promise<void> =>
    apiClient
      .delete(`/fichas-perfil/items/${itemId}`)
      .then(() => undefined),

  consultarEstudiantesVinculados: (idFichaPerfil: string): Promise<EstudianteVinculado[]> =>
    apiClient
      .get<EstudianteFichaPerfilResponseDTO[]>(`/fichas-perfil/${idFichaPerfil}/estudiantes`)
      .then((r) =>
        r.data.map((dto) => ({
          idVinculo: dto.id,
          id: dto.estudianteId,
          nombre: dto.nombre,
          email: dto.email,
        })),
      ),

  asignarEstudiantes: (req: AsignarEstudianteRequest): Promise<void> =>
    apiClient
      .post(`/fichas-perfil/${req.fichaPerfilId}/estudiantes`, { estudiantes: req.estudiantesIds })
      .then(() => undefined),

  removerEstudiante: (fichaPerfilId: string, estudianteId: string): Promise<void> =>
    apiClient
      .delete(`/fichas-perfil/${fichaPerfilId}/estudiantes/${estudianteId}`)
      .then(() => undefined),

  consultarTodosTipoItem: (): Promise<TipoItem[]> =>
    apiClient
      .get<TipoItem[]>('/fichas-perfil/tipos-item')
      .then((r) => r.data),

  getEstadosEvaluacion: (): Promise<EstadoEvaluacion[]> =>
    apiClient
      .get<EstadoEvaluacion[]>('/fichas-perfil/estados-evaluacion')
      .then((r) => r.data),

  getFichasAsesor: (page = 0, size = 10): Promise<Page<FichaPerfil>> =>
    apiClient
      .post<Page<FichaPerfil>>('/fichas-perfil/asesor', { pagina: page, tamanio: size })
      .then((r) => r.data),

  getItemsFichaRepresentante: (fichaPerfilId: string): Promise<Item[]> =>
    apiClient
      .get<ItemFichaPerfilResponseDTO[]>(`/fichas-perfil/${fichaPerfilId}/items/representante`)
      .then((r) => r.data.map(toItem)),

  getEvaluacionFicha: (fichaPerfilId: string): Promise<EvaluacionFichaPerfil[]> =>
    apiClient
      .get<EvaluacionFichaPerfilResponseDTO[]>(`/fichas-perfil/${fichaPerfilId}/evaluaciones/representante`)
      .then((r) =>
        r.data.map((dto) => ({
          id: dto.id,
          fichaPerfilId: dto.fichaPerfilId,
          fechaCreacion: dto.fechaCreacion,
          estadoEvaluacionId: dto.estadoEvaluacion,
          estadoEvaluacionNombre: dto.estadoEvaluacionNombre,
        })),
      ),

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
  consultarAsesoresDisponibles: (): Promise<Asesor[]> =>
    apiClient
      .get<Asesor[]>('/fichas-perfil/asesores')
      .then((r) => r.data),

  // Pendiente: sin endpoint en el backend.
  consultarEstudiantesDisponibles: (): Promise<Estudiante[]> =>
    apiClient
      .get<Estudiante[]>('/fichas-perfil/estudiantes')
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
  agregarEstadoFichaPerfil: (req: AgregarEstadoFichaPerfilRequest): Promise<EstadoFichaPerfil> =>
    apiClient
      .post<EstadoFichaPerfil>('/fichas-perfil/estados', req)
      .then((r) => r.data),
};
