import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import type { ConsultaCriteriaRequest, NodoFiltroDTO } from '../../../shared/models/query-criteria';
import type { AgregarObservacionEvaluacionRequest } from '../models/AgregarObservacionEvaluacionRequest';
import type { AsignarEstudianteRequest } from '../models/AsignarEstudianteRequest';
import type { ObservacionEvaluacion } from '../models/ObservacionEvaluacion';
import type { ObservacionEvaluacionCreadaResponse } from '../models/ObservacionEvaluacionCreadaResponse';
import type { CambiarAsesorRequest } from '../models/CambiarAsesorRequest';
import type { EvaluacionFichaPerfilEstudiante } from '../models/EvaluacionFichaPerfilEstudiante';
import type { EstadoFichaPerfilAsesor } from '../models/EstadoFichaPerfilAsesor';
import type { EstudianteVinculado } from '../models/EstudianteVinculado';
import type { FichaPerfilCreadaResponse } from '../models/FichaPerfilCreadaResponse';
import type { FichaPerfil } from '../models/FichaPerfil';
import type { FichaPerfilRepresentante } from '../models/FichaPerfilRepresentante';
import type { FiltrosFichasRepresentante } from '../models/FiltrosFichasRepresentante';
import type { AgregarEstadoFichaPerfilRequest } from '../models/AgregarEstadoFichaPerfilRequest';
import type { AgregarEstadoFichaPerfilResponse } from '../models/AgregarEstadoFichaPerfilResponse';
import type { RegistrarFichaPerfilRequest } from '../models/RegistrarFichaPerfilRequest';
import type { HistorialEstadoFichaPerfil } from '../models/HistorialEstadoFichaPerfil';
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

// Forma cruda de la respuesta del backend para GET /fichas-perfil/{id}/estudiantes y
// GET /fichas-perfil/{id}/estudiantes/companeros; se traduce a EstudianteVinculado
// (idVinculo/id) con aEstudianteVinculado.
interface EstudianteFichaPerfilResponseDTO {
  id: string;
  fichaPerfilId: string;
  estudianteId: string;
  nombre: string;
  email: string;
  vigente: boolean;
}

function aEstudianteVinculado(dto: EstudianteFichaPerfilResponseDTO): EstudianteVinculado {
  return {
    idVinculo: dto.id,
    id: dto.estudianteId,
    nombre: dto.nombre,
    email: dto.email,
  };
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

// Forma cruda de EvaluacionFichaPerfilEstudianteResponseDTO (GET .../evaluaciones/estudiante):
// difiere del hermano /representante, se traduce con aEvaluacionEstudiante.
interface EvaluacionFichaPerfilEstudianteResponseDTO {
  id: string;
  fichaPerfil: string;
  fechaCreacion: string;
  estadoEvaluacion: string | null;
  estadoEvaluacionNombre: string | null;
  representanteComite: { id: string; nombre: string };
}

function aEvaluacionEstudiante(
  dto: EvaluacionFichaPerfilEstudianteResponseDTO,
): EvaluacionFichaPerfilEstudiante {
  return {
    id: dto.id,
    fichaPerfilId: dto.fichaPerfil,
    fechaCreacion: dto.fechaCreacion,
    estadoEvaluacionId: dto.estadoEvaluacion,
    estadoEvaluacionNombre: dto.estadoEvaluacionNombre,
    representante: { id: dto.representanteComite.id, nombre: dto.representanteComite.nombre },
  };
}

// Forma cruda de ObservacionEvaluacionResponseDTO (GET .../observaciones/estudiante y
// .../observaciones/representante).
interface ObservacionEvaluacionResponseDTO {
  id: string;
  evaluacionFichaPerfil: string;
  observacion: string;
}

function aObservacionEvaluacion(dto: ObservacionEvaluacionResponseDTO): ObservacionEvaluacion {
  return {
    id: dto.id,
    evaluacionFichaPerfilId: dto.evaluacionFichaPerfil,
    observacion: dto.observacion,
  };
}

// Forma cruda de FichaPerfilEstudianteResponseDTO (GET /fichas-perfil/estudiante, lista);
// se traduce a MiFichaPerfilResponse con aFicha.
interface FichaPerfilEstudianteResponseDTO {
  idFichaPerfil: string;
  titulo: string;
  asesor: { id: string; identificador: string; nombre: string; email: string };
  estado: { id: string; nombre: string; fechaActualizacion: string };
  estudiantes: {
    id: string;
    fichaPerfilId: string;
    estudianteId: string;
    nombre: string;
    email: string;
    vigente: boolean;
  }[];
}

function aFicha(dto: FichaPerfilEstudianteResponseDTO): MiFichaPerfilResponse {
  return {
    id: dto.idFichaPerfil,
    tituloProyecto: dto.titulo,
    asesor: { id: dto.asesor.id, nombre: dto.asesor.nombre, email: dto.asesor.email },
    estadoActual: {
      id: dto.estado.id,
      nombre: dto.estado.nombre,
      fechaActualizacion: dto.estado.fechaActualizacion,
    },
    integrantes: dto.estudiantes.map((e) => ({
      id: e.estudianteId,
      nombre: e.nombre,
      email: e.email,
    })),
  };
}

// Forma cruda de EstadoFichaPerfilAsesorResponseDTO (POST /fichas-perfil/estados-ficha/asesor);
// el id de la ficha llega como fichaPerfil y se traduce a fichaPerfilId.
interface EstadoFichaPerfilAsesorResponseDTO {
  fichaPerfil: string;
  tituloProyecto: string;
  estadoId: string;
  estadoNombre: string;
  fechaActualizacion: string;
}

function aEstadoFichaPerfilAsesor(
  dto: EstadoFichaPerfilAsesorResponseDTO,
): EstadoFichaPerfilAsesor {
  return {
    fichaPerfilId: dto.fichaPerfil,
    tituloProyecto: dto.tituloProyecto,
    estadoId: dto.estadoId,
    estadoNombre: dto.estadoNombre,
    fechaActualizacion: dto.fechaActualizacion,
  };
}

// Forma cruda de FichaPerfilResponseDTO (POST /fichas-perfil/coordinador);
// se traduce a FichaPerfilRepresentante (estadoId = estado.id, estadoActual = estado.nombre)
// en getFichasRepresentante.
interface FichaPerfilRepresentanteResponseDTO {
  id: string;
  tituloProyecto: string;
  asesorFicha: { id: string; identificador: string; nombre: string; email: string };
  estado: { id: string; nombre: string; fechaActualizacion: string };
}

function construirFiltrosRepresentante(
  filtros: FiltrosFichasRepresentante,
): NodoFiltroDTO | undefined {
  const nodos: NodoFiltroDTO[] = [];
  const contiene = (campo: string, valor: string) => {
    const texto = valor.trim();
    if (texto) nodos.push({ tipo: 'PREDICADO', campo, operador: 'CONTIENE', valor: texto });
  };
  contiene('tituloProyecto', filtros.titulo);
  contiene('asesorNombre', filtros.asesorNombre);
  contiene('asesorEmail', filtros.asesorEmail);
  if (filtros.estadoIds.length > 0) {
    nodos.push({
      tipo: 'PREDICADO_MULTIVALOR',
      campo: 'estadoFicha',
      operador: 'IN',
      valores: filtros.estadoIds,
    });
  }
  if (nodos.length === 0) return undefined;
  if (nodos.length === 1) return nodos[0];
  return { tipo: 'GRUPO', conector: 'AND', nodos };
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

  getFichasCoordinador: (req: ConsultaCriteriaRequest): Promise<Page<FichaPerfil>> =>
    apiClient.post<Page<FichaPerfil>>('/fichas-perfil/coordinador', req).then((r) => r.data),

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

  registrarEvaluacion: (
    req: CrearEvaluacionFichaPerfilRequest,
  ): Promise<EvaluacionCreadaResponse> =>
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

  agregarObservacionEvaluacion: (
    req: AgregarObservacionEvaluacionRequest,
  ): Promise<ObservacionEvaluacionCreadaResponse> =>
    apiClient
      .post<ObservacionEvaluacionCreadaResponse>(
        `/fichas-perfil/evaluaciones/${req.evaluacionFichaPerfilId}/observaciones`,
        { observacion: req.observacion },
      )
      .then((r) => r.data),

  getEstadosFicha: (): Promise<EstadoFicha[]> =>
    apiClient.get<EstadoFicha[]>('/fichas-perfil/estados-ficha').then((r) => r.data),

  removerItem: (itemId: string): Promise<void> =>
    apiClient.delete(`/fichas-perfil/items/${itemId}`).then(() => undefined),

  consultarEstudiantesVinculados: (idFichaPerfil: string): Promise<EstudianteVinculado[]> =>
    apiClient
      .get<EstudianteFichaPerfilResponseDTO[]>(`/fichas-perfil/${idFichaPerfil}/estudiantes`)
      .then((r) => r.data.map(aEstudianteVinculado)),

  consultarCompanerosFichaPerfil: (idFichaPerfil: string): Promise<EstudianteVinculado[]> =>
    apiClient
      .get<
        EstudianteFichaPerfilResponseDTO[]
      >(`/fichas-perfil/${idFichaPerfil}/estudiantes/companeros`)
      .then((r) => r.data.map(aEstudianteVinculado)),

  asignarEstudiantes: (req: AsignarEstudianteRequest): Promise<void> =>
    apiClient
      .post(`/fichas-perfil/${req.fichaPerfilId}/estudiantes`, { estudiantes: req.estudiantesIds })
      .then(() => undefined),

  removerEstudiante: (fichaPerfilId: string, estudianteId: string): Promise<void> =>
    apiClient
      .delete(`/fichas-perfil/${fichaPerfilId}/estudiantes/${estudianteId}`)
      .then(() => undefined),

  consultarTodosTipoItem: (): Promise<TipoItem[]> =>
    apiClient.get<TipoItem[]>('/fichas-perfil/tipos-item').then((r) => r.data),

  getEstadosEvaluacion: (): Promise<EstadoEvaluacion[]> =>
    apiClient.get<EstadoEvaluacion[]>('/fichas-perfil/estados-evaluacion').then((r) => r.data),

  getFichasAsesor: (page = 0, size = 10): Promise<Page<FichaPerfil>> =>
    apiClient
      .post<Page<FichaPerfil>>('/fichas-perfil/asesor', { pagina: page, tamanio: size })
      .then((r) => r.data),

  getItemsFichaAsesor: (fichaPerfilId: string): Promise<Item[]> =>
    apiClient
      .get<ItemFichaPerfilResponseDTO[]>(`/fichas-perfil/${fichaPerfilId}/items`)
      .then((r) => r.data.map(toItem)),

  getItemsFichaRepresentante: (fichaPerfilId: string): Promise<Item[]> =>
    apiClient
      .get<ItemFichaPerfilResponseDTO[]>(`/fichas-perfil/${fichaPerfilId}/items/representante`)
      .then((r) => r.data.map(toItem)),

  consultarItemsMiFichaPerfil: (fichaPerfilId: string): Promise<Item[]> =>
    apiClient
      .get<ItemFichaPerfilResponseDTO[]>(`/fichas-perfil/${fichaPerfilId}/items/estudiante`)
      .then((r) => r.data.map(toItem)),

  consultarEvaluacionesMiFichaPerfil: (
    fichaPerfilId: string,
  ): Promise<EvaluacionFichaPerfilEstudiante[]> =>
    apiClient
      .get<
        EvaluacionFichaPerfilEstudianteResponseDTO[]
      >(`/fichas-perfil/${fichaPerfilId}/evaluaciones/estudiante`)
      .then((r) => r.data.map(aEvaluacionEstudiante)),

  consultarObservacionesEvaluacionMiFicha: (
    evaluacionId: string,
  ): Promise<ObservacionEvaluacion[]> =>
    apiClient
      .get<
        ObservacionEvaluacionResponseDTO[]
      >(`/fichas-perfil/evaluaciones/${evaluacionId}/observaciones/estudiante`)
      .then((r) => r.data.map(aObservacionEvaluacion)),

  consultarObservacionesEvaluacionRepresentante: (
    evaluacionId: string,
  ): Promise<ObservacionEvaluacion[]> =>
    apiClient
      .get<
        ObservacionEvaluacionResponseDTO[]
      >(`/fichas-perfil/evaluaciones/${evaluacionId}/observaciones/representante`)
      .then((r) => r.data.map(aObservacionEvaluacion)),

  getEvaluacionFicha: (fichaPerfilId: string): Promise<EvaluacionFichaPerfil[]> =>
    apiClient
      .get<
        EvaluacionFichaPerfilResponseDTO[]
      >(`/fichas-perfil/${fichaPerfilId}/evaluaciones/representante`)
      .then((r) =>
        r.data.map((dto) => ({
          id: dto.id,
          fichaPerfilId: dto.fichaPerfilId,
          fechaCreacion: dto.fechaCreacion,
          estadoEvaluacionId: dto.estadoEvaluacion,
          estadoEvaluacionNombre: dto.estadoEvaluacionNombre,
        })),
      ),

  consultarFichasPerfilEstudiante: (): Promise<MiFichaPerfilResponse[]> =>
    apiClient
      .get<FichaPerfilEstudianteResponseDTO[]>('/fichas-perfil/estudiante')
      .then(({ data }) => data.map(aFicha)),

  getEstadosFichaPerfilEstudiante: (fichaPerfilId: string): Promise<HistorialEstadoFichaPerfil[]> =>
    apiClient
      .get<HistorialEstadoFichaPerfil[]>(`/fichas-perfil/${fichaPerfilId}/estados-ficha/estudiante`)
      .then((r) => r.data),

  getEstadosFichasAsesor: (req: ConsultaCriteriaRequest): Promise<Page<EstadoFichaPerfilAsesor>> =>
    apiClient
      .post<Page<EstadoFichaPerfilAsesorResponseDTO>>('/fichas-perfil/estados-ficha/asesor', req)
      .then(({ data }) => ({ ...data, content: data.content.map(aEstadoFichaPerfilAsesor) })),

  getFichasRepresentante: (
    page: number,
    size: number,
    filtros: FiltrosFichasRepresentante,
    ordenamiento?: string[],
  ): Promise<Page<FichaPerfilRepresentante>> => {
    const body: ConsultaCriteriaRequest = { pagina: page, tamanio: size };
    if (ordenamiento) body.ordenamiento = ordenamiento;
    const nodo = construirFiltrosRepresentante(filtros);
    if (nodo) body.filtros = nodo;
    return apiClient
      .post<Page<FichaPerfilRepresentanteResponseDTO>>('/fichas-perfil/coordinador', body)
      .then(({ data }) => ({
        ...data,
        content: data.content.map((dto) => ({
          id: dto.id,
          titulo: dto.tituloProyecto,
          asesorNombre: dto.asesorFicha.nombre,
          asesorEmail: dto.asesorFicha.email,
          estadoId: dto.estado.id,
          estadoActual: dto.estado.nombre,
          estadoFechaActualizacion: dto.estado.fechaActualizacion,
        })),
      }));
  },

  agregarEstadoFichaPerfil: (
    fichaPerfilId: string,
    req: AgregarEstadoFichaPerfilRequest,
  ): Promise<AgregarEstadoFichaPerfilResponse> =>
    apiClient
      .post<AgregarEstadoFichaPerfilResponse>(`/fichas-perfil/${fichaPerfilId}/estados-ficha`, {
        estadoFicha: req.estadoFichaId,
      })
      .then((r) => r.data),
};
