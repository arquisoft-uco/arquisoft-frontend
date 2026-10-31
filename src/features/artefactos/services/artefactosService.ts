import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import type { ConsultaCriteriaRequest } from '../../../shared/models/query-criteria';
import type { ArtefactoAsesor } from '../models/ArtefactoAsesor';
import type { ArtefactoEstudiante } from '../models/ArtefactoEstudiante';
import type { EstadoRevisionAsesor } from '../models/artefactos';
import type { GenerarVersionArtefactoRequest } from '../models/GenerarVersionArtefactoRequest';
import type { GenerarVersionArtefactoResponse } from '../models/GenerarVersionArtefactoResponse';
import type { EstudianteArtefacto } from '../models/EstudianteArtefacto';
import type { ObservacionRevision } from '../models/ObservacionRevision';
import type { ObservacionRevisionResponse } from '../models/ObservacionRevisionResponse';
import type { ParticipacionArtefacto } from '../models/ParticipacionArtefacto';
import type { SolicitarCargaVersionArtefactoRequest } from '../models/SolicitarCargaVersionArtefactoRequest';
import type { SolicitarCargaVersionArtefactoResponse } from '../models/SolicitarCargaVersionArtefactoResponse';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import type { VersionRepositorioAsesor } from '../models/VersionRepositorioAsesor';

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

  consultarVersionesRepositorioAsesor: (
    req: ConsultaCriteriaRequest,
  ): Promise<Page<VersionRepositorioAsesor>> =>
    apiClient
      .post<Page<VersionRepositorioAsesor>>('/repositorio-artefactos/versiones/asesor', req)
      .then((r) => r.data),

  consultarVersionesArtefactoAsesor: (
    req: ConsultaCriteriaRequest,
  ): Promise<Page<VersionArtefacto>> =>
    apiClient.post<Page<VersionArtefacto>>('/versiones-artefacto/asesor', req).then((r) => r.data),

  consultarVersionesArtefactoEstudiante: (
    req: ConsultaCriteriaRequest,
  ): Promise<Page<VersionArtefacto>> =>
    apiClient
      .post<Page<VersionArtefacto>>('/artefactos/versiones/estudiante', req)
      .then((r) => r.data),

  getVersionArtefacto: (versionId: string): Promise<VersionArtefacto> =>
    apiClient.get<VersionArtefacto>(`/artefactos/versiones/${versionId}`).then((r) => r.data),

  getParticipacionesEstudiante: (): Promise<ParticipacionArtefacto[]> =>
    apiClient
      .get<ParticipacionArtefacto[]>('/artefactos/estudiante/participaciones')
      .then((r) => r.data),

  consultarArtefactosAsesor: (req: ConsultaCriteriaRequest): Promise<Page<ArtefactoAsesor>> =>
    apiClient.post<Page<ArtefactoAsesor>>('/artefactos/asesor', req).then((r) => r.data),

  consultarArtefactosEstudiante: (
    req: ConsultaCriteriaRequest,
  ): Promise<Page<ArtefactoEstudiante>> =>
    apiClient.post<Page<ArtefactoEstudiante>>('/artefactos/estudiante', req).then((r) => r.data),

  // Subida de una versión nueva del artefacto del estudiante, en dos pasos del backend
  solicitarCargaVersionArtefacto: (
    artefactoId: string,
    req: SolicitarCargaVersionArtefactoRequest,
  ): Promise<SolicitarCargaVersionArtefactoResponse> =>
    apiClient
      .post<SolicitarCargaVersionArtefactoResponse>(
        `/artefactos/${artefactoId}/versiones/cargas`,
        req,
      )
      .then((r) => r.data),

  generarVersionArtefacto: (
    artefactoId: string,
    req: GenerarVersionArtefactoRequest,
  ): Promise<GenerarVersionArtefactoResponse> =>
    apiClient
      .post<GenerarVersionArtefactoResponse>(`/artefactos/${artefactoId}/versiones`, req)
      .then((r) => r.data),
};
