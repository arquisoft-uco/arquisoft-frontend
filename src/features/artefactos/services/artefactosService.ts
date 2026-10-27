import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import type { ConsultaCriteriaRequest } from '../../../shared/models/query-criteria';
import type { EstadoRevisionAsesor } from '../models/artefactos';
import type { EstudianteArtefacto } from '../models/EstudianteArtefacto';
import type { ObservacionRevision } from '../models/ObservacionRevision';
import type { ObservacionRevisionResponse } from '../models/ObservacionRevisionResponse';
import type { RevisionAsesor } from '../models/RevisionAsesor';
import type { RevisionAsesorResponse } from '../models/RevisionAsesorResponse';
import type { VersionRepositorioAsesor } from '../models/VersionRepositorioAsesor';

function aObservacionRevision({
  revisionAsesor,
  estado,
  ...resto
}: ObservacionRevisionResponse): ObservacionRevision {
  return { ...resto, revisionAsesorId: revisionAsesor, estadoId: estado };
}

function aRevisionAsesor({
  versionArtefacto,
  artefacto,
  estadoRevisionAsesor,
  estadoRevisionAsesorNombre,
  ...resto
}: RevisionAsesorResponse): RevisionAsesor {
  return {
    ...resto,
    versionArtefactoId: versionArtefacto,
    artefactoId: artefacto,
    estadoId: estadoRevisionAsesor,
    estadoNombre: estadoRevisionAsesorNombre,
  };
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

  consultarRevisionesAsesor: (req: ConsultaCriteriaRequest): Promise<Page<RevisionAsesor>> =>
    apiClient
      .post<Page<RevisionAsesorResponse>>('/revisiones-asesor/asesor', req)
      .then((r) => ({ ...r.data, content: r.data.content.map(aRevisionAsesor) })),

  consultarVersionesRepositorioAsesor: (
    req: ConsultaCriteriaRequest,
  ): Promise<Page<VersionRepositorioAsesor>> =>
    apiClient
      .post<Page<VersionRepositorioAsesor>>('/repositorio-artefactos/versiones/asesor', req)
      .then((r) => r.data),
};
