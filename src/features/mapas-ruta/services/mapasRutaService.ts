import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import type { ConsultaCriteriaRequest } from '../../../shared/models/query-criteria';
import type { AgregarMapaRutaRequest } from '../models/AgregarMapaRutaRequest';
import type { AgregarMapaRutaResponse } from '../models/AgregarMapaRutaResponse';
import type { AgregarPlanEstimadoRequest } from '../models/AgregarPlanEstimadoRequest';
import type { AgregarPlanEstimadoResponse } from '../models/AgregarPlanEstimadoResponse';
import type { AsignarTareaRequest } from '../models/AsignarTareaRequest';
import type { AsignarTareaResponse } from '../models/AsignarTareaResponse';
import type { CambiarEstadoTareaRequest } from '../models/CambiarEstadoTareaRequest';
import type { AsesorProyecto } from '../models/AsesorProyecto';
import type { AsesorProyectoResponse } from '../models/AsesorProyectoResponse';
import type { CambiarFechaFinMapaRutaRequest } from '../models/CambiarFechaFinMapaRutaRequest';
import type { ModificarInformacionTareaRequest } from '../models/ModificarInformacionTareaRequest';
import type { ModificarPlanEstimadoRequest } from '../models/ModificarPlanEstimadoRequest';
import type { ModificarPlanRealRequest } from '../models/ModificarPlanRealRequest';
import type { MapaRuta } from '../models/MapaRuta';
import type { MapaRutaResponse } from '../models/MapaRutaResponse';
import type { EstadoTarea } from '../models/mapas-ruta';
import type { PlanEstimado } from '../models/PlanEstimado';
import type { PlanEstimadoResponse } from '../models/PlanEstimadoResponse';
import type { PlanReal } from '../models/PlanReal';
import type { PlanRealResponse } from '../models/PlanRealResponse';
import type { ProyectoAsesorado } from '../models/ProyectoAsesorado';
import type { ProyectoAsesoradoResponse } from '../models/ProyectoAsesoradoResponse';
import type { PaginaProyectosElegibles } from '../models/PaginaProyectosElegibles';
import type { ProyectoElegibleResponse } from '../models/ProyectoElegibleResponse';
import type { Tarea } from '../models/Tarea';
import type { TareaResponse } from '../models/TareaResponse';

const TAMANIO_PAGINA_PROYECTOS = 20;
const ESTADO_EN_PROCESO = 'EN_PROCESO';

function aMapaRuta(dto: MapaRutaResponse): MapaRuta {
  return {
    id: dto.id,
    proyectoGradoId: dto.proyectoGrado,
    titulo: dto.tituloProyecto,
    fechaInicio: dto.fechaInicio,
    fechaFin: dto.fechaFin,
  };
}

function aTarea(dto: TareaResponse): Tarea {
  return {
    id: dto.id,
    descripcion: dto.descripcion,
    mapaRutaId: dto.mapaRuta,
    fechaInicioMapaRuta: dto.fechaInicioMapaRuta,
    fechaFinMapaRuta: dto.fechaFinMapaRuta,
    estado: { id: dto.estadoItem, nombre: dto.nombreEstadoItem },
    asesor: { id: dto.asesor, nombre: dto.nombreAsesor, email: dto.emailAsesor },
  };
}

function aPlanEstimado(dto: PlanEstimadoResponse): PlanEstimado {
  return {
    id: dto.id,
    tareaId: dto.tarea,
    tiempoEstimadoDias: dto.tiempoEstimadoDias,
    descripcionEstimado: dto.descripcionEstimado,
  };
}

function aPlanReal(dto: PlanRealResponse): PlanReal {
  return {
    id: dto.id,
    tareaId: dto.tarea,
    tiempoRealDias: dto.tiempoRealDias,
    descripcionReal: dto.descripcionReal,
  };
}

function aAsesorProyecto(dto: AsesorProyectoResponse): AsesorProyecto {
  return {
    id: dto.asesorId,
    nombre: dto.nombre,
    email: dto.email,
    estadoId: dto.estadoAsesor,
    actual: dto.actual,
  };
}

export const mapasRutaService = {
  agregarMapaRuta(req: AgregarMapaRutaRequest): Promise<AgregarMapaRutaResponse> {
    return apiClient
      .post<AgregarMapaRutaResponse>('/mapas-ruta', {
        proyectoGrado: req.proyectoGradoId,
        fechaInicio: req.fechaInicio,
        fechaFin: req.fechaFin,
      })
      .then((r) => r.data);
  },

  consultarProyectosElegibles(pagina: number): Promise<PaginaProyectosElegibles> {
    const criterio: ConsultaCriteriaRequest = {
      pagina,
      tamanio: TAMANIO_PAGINA_PROYECTOS,
      ordenamiento: ['tituloProyecto:ASC'],
      filtros: {
        tipo: 'PREDICADO_MULTIVALOR',
        campo: 'estadoProyectoGrado',
        operador: 'IN',
        valores: [ESTADO_EN_PROCESO],
      },
    };
    return apiClient
      .post<Page<ProyectoElegibleResponse>>('/proyectos-grado/coordinador', criterio)
      .then((r) => ({
        proyectos: r.data.content.map((dto) => ({ id: dto.id, titulo: dto.tituloProyecto })),
        siguientePagina: r.data.last ? null : r.data.page + 1,
      }));
  },

  consultarMapasRutaCoordinador(req: ConsultaCriteriaRequest): Promise<Page<MapaRuta>> {
    return apiClient.post<Page<MapaRutaResponse>>('/mapas-ruta/coordinador', req).then((r) => ({
      ...r.data,
      content: r.data.content.map(aMapaRuta),
    }));
  },

  consultarMapaRutaEstudiante(): Promise<MapaRuta> {
    return apiClient.get<MapaRutaResponse>('/mapas-ruta/estudiante').then((r) => aMapaRuta(r.data));
  },

  consultarMapaRutaProyectoAsesor(proyectoGradoId: string): Promise<MapaRuta> {
    return apiClient
      .get<MapaRutaResponse>(`/mapas-ruta/proyectos-grado/${proyectoGradoId}/asesor`)
      .then((r) => aMapaRuta(r.data));
  },

  consultarProyectosAsesor(req: ConsultaCriteriaRequest): Promise<Page<ProyectoAsesorado>> {
    return apiClient
      .post<Page<ProyectoAsesoradoResponse>>('/proyectos-grado/asesor', req)
      .then((r) => ({
        ...r.data,
        content: r.data.content.map((dto) => ({ id: dto.id, titulo: dto.tituloProyecto })),
      }));
  },

  cambiarFechaFin(mapaRutaId: string, req: CambiarFechaFinMapaRutaRequest): Promise<void> {
    return apiClient
      .patch(`/mapas-ruta/${mapaRutaId}/fecha-fin`, { fechaFin: req.fechaFin })
      .then(() => undefined);
  },

  consultarTareasMapaRuta(mapaRutaId: string, req: ConsultaCriteriaRequest): Promise<Page<Tarea>> {
    return apiClient
      .post<Page<TareaResponse>>(`/mapas-ruta/${mapaRutaId}/tareas/estudiante`, req)
      .then((r) => ({ ...r.data, content: r.data.content.map(aTarea) }));
  },

  consultarTarea(tareaId: string): Promise<Tarea> {
    return apiClient.get<TareaResponse>(`/tareas/${tareaId}`).then((r) => aTarea(r.data));
  },

  cambiarEstadoTarea(tareaId: string, req: CambiarEstadoTareaRequest): Promise<void> {
    return apiClient
      .patch(`/tareas/${tareaId}/estado-item`, { estadoItem: req.estadoItemId })
      .then(() => undefined);
  },

  asignarTarea(mapaRutaId: string, req: AsignarTareaRequest): Promise<AsignarTareaResponse> {
    return apiClient
      .post<AsignarTareaResponse>(`/mapas-ruta/${mapaRutaId}/tareas`, {
        descripcion: req.descripcion,
        asesor: req.asesorId,
      })
      .then((r) => r.data);
  },

  agregarPlanEstimado(
    tareaId: string,
    req: AgregarPlanEstimadoRequest,
  ): Promise<AgregarPlanEstimadoResponse> {
    return apiClient
      .post<AgregarPlanEstimadoResponse>(`/tareas/${tareaId}/planes-estimados`, {
        tiempoEstimadoDias: req.tiempoEstimadoDias,
        descripcionEstimado: req.descripcionEstimado,
      })
      .then((r) => r.data);
  },

  consultarPlanesEstimadosTarea(
    tareaId: string,
    req: ConsultaCriteriaRequest,
  ): Promise<Page<PlanEstimado>> {
    return apiClient
      .post<Page<PlanEstimadoResponse>>(`/tareas/${tareaId}/planes-estimados/estudiante`, req)
      .then((r) => ({ ...r.data, content: r.data.content.map(aPlanEstimado) }));
  },

  consultarPlanesRealesTarea(
    tareaId: string,
    req: ConsultaCriteriaRequest,
  ): Promise<Page<PlanReal>> {
    return apiClient
      .post<Page<PlanRealResponse>>(`/mapas-ruta/tareas/${tareaId}/planes-reales/estudiante`, req)
      .then((r) => ({ ...r.data, content: r.data.content.map(aPlanReal) }));
  },

  modificarPlanEstimado(planEstimadoId: string, req: ModificarPlanEstimadoRequest): Promise<void> {
    return apiClient
      .patch(`/planes-estimados/${planEstimadoId}`, {
        descripcionEstimado: req.descripcionEstimado,
      })
      .then(() => undefined);
  },

  modificarPlanReal(planRealId: string, req: ModificarPlanRealRequest): Promise<void> {
    return apiClient
      .patch(`/mapas-ruta/planes-reales/${planRealId}`, {
        tiempoRealDias: req.tiempoRealDias,
        descripcionReal: req.descripcionReal,
      })
      .then(() => undefined);
  },

  eliminarPlanEstimado(planEstimadoId: string): Promise<void> {
    return apiClient.delete(`/mapas-ruta/planes-estimados/${planEstimadoId}`).then(() => undefined);
  },

  modificarInformacionTarea(tareaId: string, req: ModificarInformacionTareaRequest): Promise<void> {
    return apiClient
      .patch(`/tareas/${tareaId}`, { descripcion: req.descripcion, asesor: req.asesorId })
      .then(() => undefined);
  },

  eliminarTarea(tareaId: string): Promise<void> {
    return apiClient.delete(`/tareas/${tareaId}`).then(() => undefined);
  },

  consultarAsesoresProyecto(proyectoGradoId: string): Promise<AsesorProyecto[]> {
    return apiClient
      .get<AsesorProyectoResponse[]>(`/proyectos-grado/${proyectoGradoId}/asesores-asignados`)
      .then((r) => r.data.map(aAsesorProyecto));
  },

  consultarEstadosTarea(): Promise<EstadoTarea[]> {
    return apiClient.get<EstadoTarea[]>('/estados-item').then((r) => r.data);
  },
};
