import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import type { ConsultaCriteriaRequest } from '../../../shared/models/query-criteria';
import type { ArtefactoEntregable } from '../models/ArtefactoEntregable';
import type { CambiarEstadoEntregableRequest } from '../models/CambiarEstadoEntregableRequest';
import type { GenerarEntregableResponse } from '../models/GenerarEntregableResponse';
import type { VistaPreviaPaquete } from '../models/VistaPreviaPaquete';
import type { ProyectoGradoAsesor } from '../models/ProyectoGradoAsesor';
import type { EntregableProyectoGrado } from '../models/EntregableProyectoGrado';
import type { EstadoEntregableProyectoGradoResponse } from '../models/EstadoEntregableProyectoGradoResponse';
import type { HistorialEstadoEntregable } from '../models/HistorialEstadoEntregable';
import type { EstadoEntregable } from '../models/entregables';
import type { EnlaceDescargaVersion } from '../../../shared/models/EnlaceDescargaVersion';

// Ids del catálogo de estados del backend sobre los que se puede generar un entregable
const ESTADOS_PROYECTO_GENERABLES = ['EN_PROCESO', 'ATRASADO'];

const TAMANIO_PAGINA_MAXIMO = 100;
const ESTADO_ENTREGABLE_CANCELADO = 'CANCELADO';

function criteriosEntregablesVigentes(pagina: number): ConsultaCriteriaRequest {
  return {
    pagina,
    tamanio: TAMANIO_PAGINA_MAXIMO,
    filtros: {
      tipo: 'PREDICADO',
      campo: 'estadoEntregable',
      operador: 'NO_ES',
      valor: ESTADO_ENTREGABLE_CANCELADO,
    },
  };
}

function aHistorialEstadoEntregable(
  r: EstadoEntregableProyectoGradoResponse,
): HistorialEstadoEntregable {
  return {
    id: r.id,
    estado: { id: r.estadoEntregable, nombre: r.estadoEntregableNombre },
    fechaActualizacion: r.fechaActualizacion,
  };
}

export const entregablesService = {
  getEstadosEntregable: (): Promise<EstadoEntregable[]> =>
    apiClient.get<EstadoEntregable[]>('/estados-entregable').then((r) => r.data),

  consultarEntregablesAsesor: (
    req: ConsultaCriteriaRequest,
  ): Promise<Page<EntregableProyectoGrado>> =>
    apiClient
      .post<Page<EntregableProyectoGrado>>('/entregables-proyecto-grado/asesor', req)
      .then((r) => r.data),

  consultarEntregablesEstudiante: (
    proyectoGradoId: string,
    req: ConsultaCriteriaRequest,
  ): Promise<Page<EntregableProyectoGrado>> =>
    apiClient
      .post<
        Page<EntregableProyectoGrado>
      >(`/proyectos-grado/${proyectoGradoId}/entregables/estudiante`, req)
      .then((r) => r.data),

  consultarEntregablesJurado: (
    req: ConsultaCriteriaRequest,
  ): Promise<Page<EntregableProyectoGrado>> =>
    apiClient
      .post<Page<EntregableProyectoGrado>>('/entregables-proyecto-grado/jurado', req)
      .then((r) => r.data),

  obtenerEnlacePaquete: (entregableId: string): Promise<EnlaceDescargaVersion> =>
    apiClient
      .get<EnlaceDescargaVersion>(`/entregables/${entregableId}/paquete`)
      .then((r) => r.data),

  generarEntregable: (proyectoGradoId: string): Promise<GenerarEntregableResponse> =>
    apiClient
      .post<GenerarEntregableResponse>(`/proyectos-grado/${proyectoGradoId}/entregables`)
      .then((r) => r.data),

  cambiarEstadoEntregable: (
    entregableId: string,
    req: CambiarEstadoEntregableRequest,
  ): Promise<void> =>
    apiClient
      .patch(`/entregables-proyecto-grado/${entregableId}/estado`, {
        estadoEntregable: req.estadoEntregableId,
      })
      .then(() => undefined),

  consultarArtefactosEntregable: (entregableId: string): Promise<ArtefactoEntregable[]> =>
    apiClient
      .get<ArtefactoEntregable[]>(`/entregables-proyecto-grado/${entregableId}/artefactos`)
      .then((r) => r.data),

  consultarHistorialEstadosEntregable: (
    entregableId: string,
  ): Promise<HistorialEstadoEntregable[]> =>
    apiClient
      .get<EstadoEntregableProyectoGradoResponse[]>(`/entregables/${entregableId}/estados`)
      .then((r) => r.data.map(aHistorialEstadoEntregable)),

  consultarProyectosAsesor: (): Promise<ProyectoGradoAsesor[]> => {
    const req: ConsultaCriteriaRequest = {
      pagina: 0,
      tamanio: 100,
      ordenamiento: ['tituloProyecto:ASC'],
      filtros: {
        tipo: 'PREDICADO_MULTIVALOR',
        campo: 'estadoProyectoGrado',
        operador: 'IN',
        valores: [...ESTADOS_PROYECTO_GENERABLES],
      },
    };
    return apiClient
      .post<Page<ProyectoGradoAsesor>>('/proyectos-grado/asesor', req)
      .then((r) => r.data.content);
  },

  consultarVistaPreviaPaquete: (proyectoGradoId: string): Promise<VistaPreviaPaquete> =>
    apiClient
      .get<VistaPreviaPaquete>(
        `/entregables/proyectos-grado/${proyectoGradoId}/vista-previa-paquete`,
      )
      .then((r) => r.data),

  consultarProyectosConEntregableVigente: async (): Promise<string[]> => {
    const consultar = (pagina: number) =>
      apiClient
        .post<
          Page<EntregableProyectoGrado>
        >('/entregables-proyecto-grado/asesor', criteriosEntregablesVigentes(pagina))
        .then((r) => r.data);

    const primera = await consultar(0);
    const restantes = await Promise.all(
      Array.from({ length: Math.max(primera.totalPages - 1, 0) }, (_, i) => consultar(i + 1)),
    );
    return [primera, ...restantes].flatMap((p) => p.content.map((e) => e.proyectoGrado.id));
  },
};
