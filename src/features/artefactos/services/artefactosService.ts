import apiClient from '../../../api/axiosInstance';
import type { EstadoRevisionAsesor } from '../models/artefactos';
import type { EstudianteArtefacto } from '../models/EstudianteArtefacto';
import type { ObservacionRevision } from '../models/ObservacionRevision';
import type { ObservacionRevisionResponse } from '../models/ObservacionRevisionResponse';

function aObservacionRevision({
  revisionAsesor,
  estado,
  ...resto
}: ObservacionRevisionResponse): ObservacionRevision {
  return { ...resto, revisionAsesorId: revisionAsesor, estadoId: estado };
}

export const artefactosService = {
  getEstadosRevisionAsesor: (): Promise<EstadoRevisionAsesor[]> =>
    apiClient.get<EstadoRevisionAsesor[]>('/estados-revision-asesor').then((r) => r.data),

  getEstudiantesArtefacto: (artefactoId: string): Promise<EstudianteArtefacto[]> =>
    apiClient
      .get<EstudianteArtefacto[]>(`/artefactos/${artefactoId}/estudiantes`)
      .then((r) => r.data),

  getObservacionesRevision: (revisionAsesorId: string): Promise<ObservacionRevision[]> =>
    apiClient
      .get<ObservacionRevisionResponse[]>(`/revisiones-asesor/${revisionAsesorId}/observaciones`)
      .then((r) => r.data.map(aObservacionRevision)),

  getObservacionesRevisionEstudiante: (revisionAsesorId: string): Promise<ObservacionRevision[]> =>
    apiClient
      .get<
        ObservacionRevisionResponse[]
      >(`/revisiones-asesor/${revisionAsesorId}/observaciones/estudiante`)
      .then((r) => r.data.map(aObservacionRevision)),
};
