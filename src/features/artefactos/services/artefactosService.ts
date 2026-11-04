import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import type { ConsultaCriteriaRequest } from '../../../shared/models/query-criteria';
import type { AsignarArtefactoRequest } from '../models/AsignarArtefactoRequest';
import type { AsignarArtefactoResponse } from '../models/AsignarArtefactoResponse';
import type { EstudianteAsignable } from '../models/EstudianteAsignable';
import type { PaginaProyectosAsignables } from '../models/PaginaProyectosAsignables';
import type { ArtefactoAsesor } from '../models/ArtefactoAsesor';
import type { ArtefactoEstudiante } from '../models/ArtefactoEstudiante';
import type { CambiarAsesorArtefactoRequest } from '../models/CambiarAsesorArtefactoRequest';
import type { CambiarVersionRepositorioArtefactoRequest } from '../models/CambiarVersionRepositorioArtefactoRequest';
import type { CambiarEstadoObservacionEstudianteRequest } from '../models/CambiarEstadoObservacionEstudianteRequest';
import type { CambiarEstadoObservacionRequest } from '../models/CambiarEstadoObservacionRequest';
import type { EstadoRevisionAsesor } from '../models/artefactos';
import type { GenerarVersionArtefactoRequest } from '../models/GenerarVersionArtefactoRequest';
import type { GenerarVersionArtefactoResponse } from '../models/GenerarVersionArtefactoResponse';
import type { EstudianteArtefacto } from '../models/EstudianteArtefacto';
import type { MarcarRevisionResueltaRequest } from '../models/MarcarRevisionResueltaRequest';
import type { ObservacionRevision } from '../models/ObservacionRevision';
import type { ObservacionRevisionResponse } from '../models/ObservacionRevisionResponse';
import type { ParticipacionArtefacto } from '../models/ParticipacionArtefacto';
import type { RemoverEstudianteArtefactoRequest } from '../models/RemoverEstudianteArtefactoRequest';
import type { RegistrarObservacionRequest } from '../models/RegistrarObservacionRequest';
import type { RegistrarObservacionResponse } from '../models/RegistrarObservacionResponse';
import type { RegistrarRevisionResponse } from '../models/RegistrarRevisionResponse';
import type { SolicitarCargaVersionArtefactoRequest } from '../models/SolicitarCargaVersionArtefactoRequest';
import type { SolicitarCargaVersionArtefactoResponse } from '../models/SolicitarCargaVersionArtefactoResponse';
import type { VincularEstudiantesArtefactoRequest } from '../models/VincularEstudiantesArtefactoRequest';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import type { VersionRepositorioAsesor } from '../models/VersionRepositorioAsesor';
import { ESTADO_REVISION_RESUELTA } from '../utils/revision-resoluble';

const TAMANIO_PAGINA_PROYECTOS = 100;
const TAMANIO_PAGINA_ARTEFACTOS = 100;

interface ProyectoAsesorResponse {
  id: string;
  tituloProyecto: string;
}

// `omitido` no es filtrable en el criterio del backend: se recorre el catálogo completo
async function getIdsArtefactosOmitidosAsesor(): Promise<string[]> {
  const omitidos: string[] = [];
  let pagina = 0;
  let ultima = false;
  while (!ultima) {
    const { data } = await apiClient.post<Page<ArtefactoAsesor>>('/artefactos/asesor', {
      pagina,
      tamanio: TAMANIO_PAGINA_ARTEFACTOS,
      ordenamiento: ['nombreProyecto:ASC'],
    });
    omitidos.push(...data.content.filter((artefacto) => artefacto.omitido).map((a) => a.id));
    ultima = data.last;
    pagina += 1;
  }
  return omitidos;
}

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

  removerEstudianteArtefacto: (req: RemoverEstudianteArtefactoRequest): Promise<void> =>
    apiClient
      .delete(`/artefactos/${req.artefactoId}/estudiantes/${req.estudianteId}`)
      .then(() => undefined),

  vincularEstudiantes: (
    artefactoId: string,
    req: VincularEstudiantesArtefactoRequest,
  ): Promise<void> =>
    apiClient
      .post(`/artefactos/${artefactoId}/estudiantes`, { estudiantes: req.estudiantes })
      .then(() => undefined),

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

  eliminarObservacion: (observacionId: string): Promise<void> =>
    apiClient.delete(`/artefactos/observaciones/${observacionId}`).then(() => undefined),

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

  eliminarVersionArtefacto: (versionId: string): Promise<void> =>
    apiClient.delete(`/artefactos/versiones/${versionId}`).then(() => undefined),

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

  cambiarAsesorArtefacto: (req: CambiarAsesorArtefactoRequest): Promise<void> =>
    apiClient
      .patch(`/artefactos/${req.artefactoId}/asesor`, { asesor: req.asesorId })
      .then(() => undefined),

  cambiarVersionRepositorioArtefacto: (
    req: CambiarVersionRepositorioArtefactoRequest,
  ): Promise<void> =>
    apiClient
      .patch(`/artefactos/${req.artefactoId}/version-repositorio`, {
        versionRepositorioArtefacto: req.versionRepositorioId,
      })
      .then(() => undefined),

  marcarRevisionResuelta: (req: MarcarRevisionResueltaRequest): Promise<void> =>
    apiClient
      .patch(`/artefactos/revisiones/${req.revisionAsesorId}/estado`, {
        estado: ESTADO_REVISION_RESUELTA,
      })
      .then(() => undefined),

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

  asignarArtefacto: (req: AsignarArtefactoRequest): Promise<AsignarArtefactoResponse> =>
    apiClient
      .post<AsignarArtefactoResponse>('/artefactos', {
        proyectoGrado: req.proyectoGrado,
        versionRepositorioArtefacto: req.versionRepositorioArtefacto,
        estudiantes: req.estudiantes,
      })
      .then((r) => r.data),

  omitirArtefacto: (artefactoId: string): Promise<void> =>
    apiClient.delete(`/artefactos/${artefactoId}`).then(() => undefined),

  registrarRevision: (versionArtefactoId: string): Promise<RegistrarRevisionResponse> =>
    apiClient
      .post<RegistrarRevisionResponse>(`/artefactos/versiones/${versionArtefactoId}/revisiones`)
      .then((r) => r.data),

  enviarRevision: (revisionAsesorId: string): Promise<void> =>
    apiClient.patch(`/artefactos/revisiones/${revisionAsesorId}/envio`).then(() => undefined),

  cerrarRevision: (revisionAsesorId: string): Promise<void> =>
    apiClient.patch(`/artefactos/revisiones/${revisionAsesorId}/cierre`).then(() => undefined),

  registrarObservacion: (
    revisionAsesorId: string,
    req: RegistrarObservacionRequest,
  ): Promise<RegistrarObservacionResponse> =>
    apiClient
      .post<RegistrarObservacionResponse>(
        `/artefactos/revisiones/${revisionAsesorId}/observaciones`,
        {
          descripcion: req.descripcion,
        },
      )
      .then((r) => r.data),

  cambiarEstadoObservacion: (
    observacionId: string,
    req: CambiarEstadoObservacionRequest,
  ): Promise<void> =>
    apiClient
      .patch(`/artefactos/observaciones/${observacionId}/estado-asesor`, { estado: req.estado })
      .then(() => undefined),

  cambiarEstadoObservacionEstudiante: (
    observacionId: string,
    req: CambiarEstadoObservacionEstudianteRequest,
  ): Promise<void> =>
    apiClient
      .patch(`/artefactos/observaciones/${observacionId}/estado-estudiante`, { estado: req.estado })
      .then(() => undefined),

  getIdsArtefactosOmitidosAsesor,

  consultarProyectosAsignables: (pagina: number): Promise<PaginaProyectosAsignables> =>
    apiClient
      .post<Page<ProyectoAsesorResponse>>('/proyectos-grado/asesor', {
        pagina,
        tamanio: TAMANIO_PAGINA_PROYECTOS,
        ordenamiento: ['tituloProyecto:ASC'],
      })
      .then((r) => ({
        proyectos: r.data.content.map((dto) => ({ id: dto.id, titulo: dto.tituloProyecto })),
        siguientePagina: r.data.last ? null : r.data.page + 1,
      })),

  getEstudiantesProyectoAsesorado: (proyectoGradoId: string): Promise<EstudianteAsignable[]> =>
    apiClient
      .get<EstudianteAsignable[]>(`/proyectos-grado/${proyectoGradoId}/estudiantes-asesorados`)
      .then((r) => r.data),
};
