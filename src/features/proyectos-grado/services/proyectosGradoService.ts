import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import type { ConsultaCriteriaRequest } from '../../../shared/models/query-criteria';
import type { AsesorProyectoGrado } from '../models/AsesorProyectoGrado';
import type { AsesorProyectoGradoResponse } from '../models/AsesorProyectoGradoResponse';
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

export const proyectosGradoService = {
  getProyectosCoordinador(req: ConsultaCriteriaRequest): Promise<Page<ProyectoGrado>> {
    return apiClient
      .post<Page<ProyectoGrado>>('/proyectos-grado/coordinador', req)
      .then((r) => r.data);
  },

  getAsesoresProyecto(proyectoGradoId: string): Promise<AsesorProyectoGrado[]> {
    return apiClient
      .get<AsesorProyectoGradoResponse[]>(`/proyectos-grado/${proyectoGradoId}/asesores`)
      .then((r) => r.data.map(aAsesorProyectoGrado));
  },
};
