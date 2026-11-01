import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import type { ConsultaCriteriaRequest } from '../../../shared/models/query-criteria';
import type { AsignarArtefactoRequest } from '../models/AsignarArtefactoRequest';
import type { AsignarArtefactoResponse } from '../models/AsignarArtefactoResponse';
import type { EstudianteAsignable } from '../models/EstudianteAsignable';
import type { PaginaProyectosAsignables } from '../models/PaginaProyectosAsignables';
import type { ArtefactoAsesor } from '../models/ArtefactoAsesor';
import type { ArtefactoEstudiante } from '../models/ArtefactoEstudiante';
import type { EstadoRevisionAsesor } from '../models/artefactos';
import type { GenerarVersionArtefactoRequest } from '../models/GenerarVersionArtefactoRequest';
import type { GenerarVersionArtefactoResponse } from '../models/GenerarVersionArtefactoResponse';
import type { EstudianteArtefacto } from '../models/EstudianteArtefacto';
import type { ObservacionRevision } from '../models/ObservacionRevision';
import type { ObservacionRevisionResponse } from '../models/ObservacionRevisionResponse';
import type { ParticipacionArtefacto } from '../models/ParticipacionArtefacto';
import type { RegistrarRevisionResponse } from '../models/RegistrarRevisionResponse';
import type { SolicitarCargaVersionArtefactoRequest } from '../models/SolicitarCargaVersionArtefactoRequest';
import type { SolicitarCargaVersionArtefactoResponse } from '../models/SolicitarCargaVersionArtefactoResponse';
import type { VincularEstudiantesArtefactoRequest } from '../models/VincularEstudiantesArtefactoRequest';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import type { VersionRepositorioAsesor } from '../models/VersionRepositorioAsesor';

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

  vincularEstudiantes: (
    artefactoId: string,
    req: VincularEstudiantesArtefactoRequest,
  ): Promise<void> =>
    apiClient
      .post(`/artefactos/${artefactoId}/estudiantes`, { estudiantes: req.estudiantes })
      .then(() => undefined),

  removerEstudiante: (artefactoId: string, estudianteId: string): Promise<void> =>
    apiClient
      .delete(`/artefactos/${artefactoId}/estudiantes/${estudianteId}`)
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
