import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import type { ConsultaCriteriaRequest } from '../../../shared/models/query-criteria';
import type { AgregarMapaRutaRequest } from '../models/AgregarMapaRutaRequest';
import type { AgregarMapaRutaResponse } from '../models/AgregarMapaRutaResponse';
import type { CambiarFechaFinMapaRutaRequest } from '../models/CambiarFechaFinMapaRutaRequest';
import type { MapaRuta } from '../models/MapaRuta';
import type { MapaRutaResponse } from '../models/MapaRutaResponse';
import type { EstadoTarea } from '../models/mapas-ruta';
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
    estado: { id: dto.estadoItem, nombre: dto.nombreEstadoItem },
    asesor: { id: dto.asesor, nombre: dto.nombreAsesor, email: dto.emailAsesor },
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

  consultarEstadosTarea(): Promise<EstadoTarea[]> {
    return apiClient.get<EstadoTarea[]>('/estados-item').then((r) => r.data);
  },
};
