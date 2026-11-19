import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import type {
  ConsultaCriteriaRequest,
  NodoFiltroDTO,
  PredicadoFiltro,
} from '../../../shared/models/query-criteria';
import { Rol } from '../../../shared/models/rol';
import type { EstadoDeFicha } from '../models/EstadoDeFicha';
import type { FichaDelEstudiante } from '../models/FichaDelEstudiante';
import type { ArtefactoSinAvance } from '../models/ArtefactoSinAvance';
import type { EntregablePorPublicar } from '../models/EntregablePorPublicar';
import type { EvaluacionPorEvaluar } from '../models/EvaluacionPorEvaluar';
import type { FichaResumen } from '../models/FichaResumen';
import type { RecursoContable } from '../models/RecursoContable';

// Clave primaria del catálogo estado_ficha (migración V20260624215912); B2 de docs/pendientes.md.
const ESTADO_POR_EVALUAR = 'DISPONIBLE_PARA_EVALUACION';
export const ESTADO_JURADO_POR_EVALUAR = 'PENDIENTE_POR_EVALUAR';
const TAMANIO_BANDEJA = 5;
// Igual al valor por defecto del reporte de artefactos sin avance (artefactos/utils/dias-sin-avance.ts).
export const DIAS_SIN_AVANCE = 15;

const RUTA_CONTEO: Record<RecursoContable, string> = {
  'fichas-coordinador': '/fichas-perfil/coordinador',
  'fichas-asesor': '/fichas-perfil/asesor',
  'evaluaciones-fichas-asesor': '/fichas-perfil/evaluaciones/asesor',
  'proyectos-coordinador': '/proyectos-grado/coordinador',
  'proyectos-asesor': '/proyectos-grado/asesor',
  'evaluaciones-coordinador': '/evaluaciones/coordinador',
  'evaluaciones-estudiante': '/evaluaciones/estudiante',
  'evaluaciones-asesor': '/evaluaciones/evaluaciones-asesor/asesor',
  'evaluaciones-jurado': '/evaluaciones/evaluaciones-jurado/jurado',
  'mapas-ruta-coordinador': '/mapas-ruta/coordinador',
  'artefactos-asesor': '/artefactos/asesor',
  'artefactos-estudiante': '/artefactos/estudiante',
  'entregables-asesor': '/entregables-proyecto-grado/asesor',
  'entregables-jurado': '/entregables-proyecto-grado/jurado',
  documentaciones: '/biblioteca/documentaciones/consultar',
  'entregables-por-publicar': '/biblioteca/entregables-proyecto-grado/consultar',
  'repositorios-artefactos': '/repositorio-artefactos/administrador',
  'solicitudes-novedad-coordinador-recibidas': '/solicitudes/novedad-coordinador/recibidas',
  'solicitudes-cambio-asesor-recibidas': '/solicitudes/cambio-asesor/recibidas',
  'solicitudes-ampliacion-plazo-recibidas': '/solicitudes/ampliacion-plazo/recibidas',
  'solicitudes-novedad-asesor-recibidas': '/solicitudes/novedad-asesor/recibidas',
  'solicitudes-registro-usuarios-recibidas':
    '/solicitudes/registro-modificacion-usuarios/recibidas',
};

const CAMPO_POR_ROL: Partial<Record<Rol, string>> = {
  [Rol.Estudiante]: 'esEstudiante',
  [Rol.Asesor]: 'esAsesor',
  [Rol.AsesorFicha]: 'esAsesorFicha',
  [Rol.Coordinador]: 'esCoordinador',
  [Rol.RepresentanteComiteCurriculum]: 'esRepresentanteComite',
  [Rol.Administrador]: 'esAdministrador',
  [Rol.Bibliotecario]: 'esBibliotecario',
};

// Sin Jurado: el criterio de usuarios no expone esJurado (B4, TODO HU252).
export const ROLES_CONTABLES: readonly Rol[] = Object.keys(CAMPO_POR_ROL) as Rol[];

interface FichaEstudianteDTO {
  idFichaPerfil: string;
  titulo: string;
  asesor: { id: string; nombre: string; email: string };
  estado: { id: string; nombre: string; fechaActualizacion: string };
  estudiantes: { estudianteId: string; nombre: string; email: string; vigente: boolean }[];
}

interface FichaCoordinadorDTO {
  id: string;
  tituloProyecto: string;
  asesorFicha: { nombre: string; email: string };
  estado: { id: string; nombre: string; fechaActualizacion: string };
}

interface EvaluacionJuradoDTO {
  id: string;
  estado: { id: string; nombre: string };
  entregable: { id: string; proyecto: string; version: number };
}

interface ArtefactoSinAvanceDTO {
  id: string;
  nombreProyecto: string;
  nombreDocumento: string;
  versionDocumento: number;
  diasSinAvance?: number;
  estadoUltimaRevision?: string;
}

interface EntregableDisponibleDTO {
  id: string;
  tituloProyecto: string | null;
  versionEntregable: number;
  autores: { id: string; nombre: string }[];
}

interface FiltroUsuarios {
  vigente?: boolean;
  rol?: Rol;
}

function predicado(campo: string, valor: string): PredicadoFiltro {
  return { tipo: 'PREDICADO', campo, operador: 'ES', valor };
}

function filtroUsuarios({ vigente, rol }: FiltroUsuarios): NodoFiltroDTO | undefined {
  const nodos: NodoFiltroDTO[] = [];
  if (vigente !== undefined) nodos.push(predicado('vigente', String(vigente)));
  const campoRol = rol === undefined ? undefined : CAMPO_POR_ROL[rol];
  if (campoRol !== undefined) nodos.push(predicado(campoRol, 'true'));
  if (nodos.length === 0) return undefined;
  if (nodos.length === 1) return nodos[0];
  return { tipo: 'GRUPO', conector: 'AND', nodos };
}

function aFichaDelEstudiante(dto: FichaEstudianteDTO): FichaDelEstudiante {
  return {
    id: dto.idFichaPerfil,
    titulo: dto.titulo,
    asesorNombre: dto.asesor.nombre,
    estadoId: dto.estado.id,
    estadoNombre: dto.estado.nombre,
    fechaActualizacion: dto.estado.fechaActualizacion,
    integrantes: dto.estudiantes.map((e) => e.nombre),
  };
}

function aFichaResumen(dto: FichaCoordinadorDTO): FichaResumen {
  return {
    id: dto.id,
    titulo: dto.tituloProyecto,
    asesorNombre: dto.asesorFicha.nombre,
    asesorEmail: dto.asesorFicha.email,
    estadoId: dto.estado.id,
    estadoNombre: dto.estado.nombre,
    fechaActualizacion: dto.estado.fechaActualizacion,
  };
}

function aEvaluacionPorEvaluar(dto: EvaluacionJuradoDTO): EvaluacionPorEvaluar {
  return {
    id: dto.id,
    proyecto: dto.entregable.proyecto,
    versionEntregable: dto.entregable.version,
    estadoId: dto.estado.id,
    estadoNombre: dto.estado.nombre,
  };
}

function aArtefactoSinAvance(dto: ArtefactoSinAvanceDTO): ArtefactoSinAvance {
  return {
    id: dto.id,
    nombreDocumento: dto.nombreDocumento,
    versionDocumento: dto.versionDocumento,
    nombreProyecto: dto.nombreProyecto,
    diasSinAvance: dto.diasSinAvance,
    estadoUltimaRevision: dto.estadoUltimaRevision,
  };
}

function aEntregablePorPublicar(dto: EntregableDisponibleDTO): EntregablePorPublicar {
  return {
    id: dto.id,
    tituloProyecto: dto.tituloProyecto,
    versionEntregable: dto.versionEntregable,
    autores: dto.autores.map((autor) => autor.nombre),
  };
}

function conContenido<D, M>(pagina: Page<D>, mapear: (dto: D) => M): Page<M> {
  return { ...pagina, content: pagina.content.map(mapear) };
}

export const dashboardService = {
  consultarFichasEstudiante: (): Promise<FichaDelEstudiante[]> =>
    apiClient
      .get<FichaEstudianteDTO[]>('/fichas-perfil/estudiante')
      .then(({ data }) => data.map(aFichaDelEstudiante)),

  consultarEstadosFichaEstudiante: (fichaId: string): Promise<EstadoDeFicha[]> =>
    apiClient
      .get<EstadoDeFicha[]>(`/fichas-perfil/${fichaId}/estados-ficha/estudiante`)
      .then((r) => r.data),

  consultarFichasPorEvaluar: (): Promise<Page<FichaResumen>> => {
    const body: ConsultaCriteriaRequest = {
      pagina: 0,
      tamanio: TAMANIO_BANDEJA,
      ordenamiento: ['tituloProyecto:ASC'],
      filtros: {
        tipo: 'PREDICADO_MULTIVALOR',
        campo: 'estadoFicha',
        operador: 'IN',
        valores: [ESTADO_POR_EVALUAR],
      },
    };
    return apiClient
      .post<Page<FichaCoordinadorDTO>>('/fichas-perfil/coordinador', body)
      .then(({ data }) => conContenido(data, aFichaResumen));
  },

  consultarFichasAsesoradas: (): Promise<Page<FichaResumen>> =>
    apiClient
      .post<Page<FichaCoordinadorDTO>>('/fichas-perfil/asesor', {
        pagina: 0,
        tamanio: TAMANIO_BANDEJA,
      })
      .then(({ data }) => conContenido(data, aFichaResumen)),

  consultarEvaluacionesPorEvaluar: (): Promise<Page<EvaluacionPorEvaluar>> => {
    const body: ConsultaCriteriaRequest = {
      pagina: 0,
      tamanio: TAMANIO_BANDEJA,
      filtros: {
        tipo: 'PREDICADO_MULTIVALOR',
        campo: 'estadoJurado',
        operador: 'IN',
        valores: [ESTADO_JURADO_POR_EVALUAR],
      },
    };
    return apiClient
      .post<Page<EvaluacionJuradoDTO>>('/evaluaciones/evaluaciones-jurado/jurado', body)
      .then(({ data }) => conContenido(data, aEvaluacionPorEvaluar));
  },

  consultarArtefactosSinAvance: (): Promise<Page<ArtefactoSinAvance>> => {
    const criterio: ConsultaCriteriaRequest = {
      pagina: 0,
      tamanio: TAMANIO_BANDEJA,
      ordenamiento: ['fechaUltimaVersion:ASC'],
      filtros: {
        tipo: 'GRUPO',
        conector: 'AND',
        nodos: [predicado('proyectoFinalizado', 'false'), predicado('proyectoCancelado', 'false')],
      },
    };
    return apiClient
      .post<Page<ArtefactoSinAvanceDTO>>('/artefactos/asesor/sin-avance', {
        diasSinAvance: DIAS_SIN_AVANCE,
        criterio,
      })
      .then(({ data }) => conContenido(data, aArtefactoSinAvance));
  },

  consultarEntregablesPorPublicar: (): Promise<Page<EntregablePorPublicar>> =>
    apiClient
      .post<Page<EntregableDisponibleDTO>>('/biblioteca/entregables-proyecto-grado/consultar', {
        pagina: 0,
        tamanio: TAMANIO_BANDEJA,
      })
      .then(({ data }) => conContenido(data, aEntregablePorPublicar)),

  contar: (recurso: RecursoContable): Promise<number> =>
    apiClient
      .post<Page<unknown>>(RUTA_CONTEO[recurso], { pagina: 0, tamanio: 1 })
      .then((r) => r.data.totalElements),

  contarFichas: (): Promise<number> =>
    apiClient
      .post<Page<unknown>>('/fichas-perfil/coordinador', { pagina: 0, tamanio: 1 })
      .then((r) => r.data.totalElements),

  contarUsuarios: (filtro: FiltroUsuarios): Promise<number> => {
    const body: ConsultaCriteriaRequest = { pagina: 0, tamanio: 1 };
    const filtros = filtroUsuarios(filtro);
    if (filtros) body.filtros = filtros;
    return apiClient
      .post<Page<unknown>>('/usuarios/administrador', body)
      .then((r) => r.data.totalElements);
  },
};
