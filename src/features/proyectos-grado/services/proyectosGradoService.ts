import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import type { ConsultaCriteriaRequest } from '../../../shared/models/query-criteria';
import type { AsesorProyectoGrado } from '../models/AsesorProyectoGrado';
import type { AsesorProyectoGradoResponse } from '../models/AsesorProyectoGradoResponse';
import type { AsignarAsesorProyectoGradoRequest } from '../models/AsignarAsesorProyectoGradoRequest';
import type { AsignarEstudiantesProyectoGradoRequest } from '../models/AsignarEstudiantesProyectoGradoRequest';
import type { CambiarEstadoAsesorProyectoGradoRequest } from '../models/CambiarEstadoAsesorProyectoGradoRequest';
import type { CompaneroProyectoGrado } from '../models/CompaneroProyectoGrado';
import type { DestituirEstudianteProyectoGradoRequest } from '../models/DestituirEstudianteProyectoGradoRequest';
import type { EstadoAsesorProyectoGrado } from '../models/EstadoAsesorProyectoGrado';
import type { EstadoProyectoGradoResponse } from '../models/EstadoProyectoGradoResponse';
import type { EstudianteAsesoradoProyectoGrado } from '../models/EstudianteAsesoradoProyectoGrado';
import type { EstudianteProyectoGrado } from '../models/EstudianteProyectoGrado';
import type { HistorialEstadoProyectoGrado } from '../models/HistorialEstadoProyectoGrado';
import type { ProyectoGrado } from '../models/ProyectoGrado';

function aAsesorProyectoGrado(r: AsesorProyectoGradoResponse): AsesorProyectoGrado {
  return {
    id: r.id,
    proyectoGradoId: r.proyectoGradoId,
    asesorId: r.asesorId,
    identificador: r.identificador,
    nombre: r.nombre,
    email: r.email,
    estado: { id: r.estadoAsesor, nombre: r.estadoAsesorNombre },
    fechaAsignado: r.fechaAsignado,
    vigente: r.vigente,
    actual: r.actual,
  };
}

function aHistorialEstadoProyectoGrado(
  r: EstadoProyectoGradoResponse,
): HistorialEstadoProyectoGrado {
  return {
    id: r.id,
    estado: { id: r.estadoProyecto, nombre: r.estadoProyectoNombre },
    fechaActualizacion: r.fechaActualizacion,
  };
}

export const proyectosGradoService = {
  getProyectosCoordinador(req: ConsultaCriteriaRequest): Promise<Page<ProyectoGrado>> {
    return apiClient
      .post<Page<ProyectoGrado>>('/proyectos-grado/coordinador', req)
      .then((r) => r.data);
  },

  getProyectosAsesor(req: ConsultaCriteriaRequest): Promise<Page<ProyectoGrado>> {
    return apiClient.post<Page<ProyectoGrado>>('/proyectos-grado/asesor', req).then((r) => r.data);
  },

  getDetalleProyectoAsesor(proyectoGradoId: string): Promise<ProyectoGrado> {
    return apiClient
      .get<ProyectoGrado>(`/proyectos-grado/${proyectoGradoId}/asesor`)
      .then((r) => r.data);
  },

  getEstudiantesAsesorados(proyectoGradoId: string): Promise<EstudianteAsesoradoProyectoGrado[]> {
    return apiClient
      .get<
        EstudianteAsesoradoProyectoGrado[]
      >(`/proyectos-grado/${proyectoGradoId}/estudiantes-asesorados`)
      .then((r) => r.data);
  },

  getAsesoresProyecto(proyectoGradoId: string): Promise<AsesorProyectoGrado[]> {
    return apiClient
      .get<AsesorProyectoGradoResponse[]>(`/proyectos-grado/${proyectoGradoId}/asesores`)
      .then((r) => r.data.map(aAsesorProyectoGrado));
  },

  getAsesoresAsignadosProyecto(proyectoGradoId: string): Promise<AsesorProyectoGrado[]> {
    return apiClient
      .get<AsesorProyectoGradoResponse[]>(`/proyectos-grado/${proyectoGradoId}/asesores-asignados`)
      .then((r) => r.data.map(aAsesorProyectoGrado));
  },

  getEstadosProyecto(proyectoGradoId: string): Promise<HistorialEstadoProyectoGrado[]> {
    return apiClient
      .get<EstadoProyectoGradoResponse[]>(`/proyectos-grado/${proyectoGradoId}/estados`)
      .then((r) => r.data.map(aHistorialEstadoProyectoGrado));
  },

  getEstadosAsesor(): Promise<EstadoAsesorProyectoGrado[]> {
    return apiClient
      .get<EstadoAsesorProyectoGrado[]>('/proyectos-grado/estados-asesor')
      .then((r) => r.data);
  },

  asignarAsesor(req: AsignarAsesorProyectoGradoRequest): Promise<void> {
    return apiClient
      .post(`/proyectos-grado/${req.proyectoGradoId}/asesores`, { asesor: req.asesorId })
      .then(() => undefined);
  },

  cambiarEstadoAsesor(req: CambiarEstadoAsesorProyectoGradoRequest): Promise<void> {
    return apiClient
      .patch(`/proyectos-grado/${req.proyectoGradoId}/asesores/${req.asesorId}/estado`, {
        estadoAsesor: req.estadoAsesorId,
      })
      .then(() => undefined);
  },

  getEstudiantesProyecto(proyectoGradoId: string): Promise<EstudianteProyectoGrado[]> {
    return apiClient
      .get<EstudianteProyectoGrado[]>(`/proyectos-grado/${proyectoGradoId}/estudiantes`)
      .then((r) => r.data);
  },

  getCompanerosProyecto(proyectoGradoId: string): Promise<CompaneroProyectoGrado[]> {
    return apiClient
      .get<CompaneroProyectoGrado[]>(`/proyectos-grado/${proyectoGradoId}/companeros`)
      .then((r) => r.data);
  },

  asignarEstudiantes(req: AsignarEstudiantesProyectoGradoRequest): Promise<void> {
    return apiClient
      .post(`/proyectos-grado/${req.proyectoGradoId}/estudiantes`, {
        estudiantes: req.estudiantesIds,
      })
      .then(() => undefined);
  },

  destituirEstudiante(req: DestituirEstudianteProyectoGradoRequest): Promise<void> {
    return apiClient
      .delete(`/proyectos-grado/${req.proyectoGradoId}/estudiantes/${req.estudianteId}`)
      .then(() => undefined);
  },
};
