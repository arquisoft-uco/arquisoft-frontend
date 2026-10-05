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
import type { FichaPorEvaluar } from '../models/FichaPorEvaluar';

// Clave primaria del catálogo estado_ficha (migración V20260624215912); B2 de docs/pendientes.md.
const ESTADO_POR_EVALUAR = 'DISPONIBLE_PARA_EVALUACION';
const TAMANIO_BANDEJA = 5;

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

function aFichaPorEvaluar(dto: FichaCoordinadorDTO): FichaPorEvaluar {
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

export const dashboardService = {
  consultarFichasEstudiante: (): Promise<FichaDelEstudiante[]> =>
    apiClient
      .get<FichaEstudianteDTO[]>('/fichas-perfil/estudiante')
      .then(({ data }) => data.map(aFichaDelEstudiante)),

  consultarEstadosFichaEstudiante: (fichaId: string): Promise<EstadoDeFicha[]> =>
    apiClient
      .get<EstadoDeFicha[]>(`/fichas-perfil/${fichaId}/estados-ficha/estudiante`)
      .then((r) => r.data),

  consultarFichasPorEvaluar: (): Promise<Page<FichaPorEvaluar>> => {
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
      .then(({ data }) => ({ ...data, content: data.content.map(aFichaPorEvaluar) }));
  },

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
