import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import type { ConsultaCriteriaRequest } from '../../../shared/models/query-criteria';
import type { AsesorProyectoGrado } from '../models/AsesorProyectoGrado';
import type { AsesorProyectoGradoResponse } from '../models/AsesorProyectoGradoResponse';
import type { AsignarAsesorProyectoGradoRequest } from '../models/AsignarAsesorProyectoGradoRequest';
import type { AsignarEstudiantesProyectoGradoRequest } from '../models/AsignarEstudiantesProyectoGradoRequest';
import type { CambiarEstadoAsesorProyectoGradoRequest } from '../models/CambiarEstadoAsesorProyectoGradoRequest';
import type { DestituirEstudianteProyectoGradoRequest } from '../models/DestituirEstudianteProyectoGradoRequest';
import type { EstadoProyectoGradoResponse } from '../models/EstadoProyectoGradoResponse';
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

  getMisProyectos(): Promise<ProyectoGrado[]> {
    return apiClient.get<ProyectoGrado[]>('/proyectos-grado/estudiante').then((r) => r.data);
  },

  getAsesoresProyecto(proyectoGradoId: string): Promise<AsesorProyectoGrado[]> {
    return apiClient
      .get<AsesorProyectoGradoResponse[]>(`/proyectos-grado/${proyectoGradoId}/asesores`)
      .then((r) => r.data.map(aAsesorProyectoGrado));
  },

  getEstadosProyecto(proyectoGradoId: string): Promise<HistorialEstadoProyectoGrado[]> {
    return apiClient
      .get<EstadoProyectoGradoResponse[]>(`/proyectos-grado/${proyectoGradoId}/estados`)
      .then((r) => r.data.map(aHistorialEstadoProyectoGrado));
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
