import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import type { ConsultaCriteriaRequest } from '../../../shared/models/query-criteria';
import type { GenerarRepositorioArtefactoRequest } from '../models/GenerarRepositorioArtefactoRequest';
import type { GenerarRepositorioArtefactoResponse } from '../models/GenerarRepositorioArtefactoResponse';
import type { ModificarRepositorioArtefactoRequest } from '../models/ModificarRepositorioArtefactoRequest';
import type { RepositorioArtefacto } from '../models/RepositorioArtefacto';
import type { SolicitarCargaVersionRequest } from '../models/SolicitarCargaVersionRequest';
import type { SolicitarCargaVersionResponse } from '../models/SolicitarCargaVersionResponse';
import type { SubirVersionRequest } from '../models/SubirVersionRequest';
import type { SubirVersionResponse } from '../models/SubirVersionResponse';
import type { VersionRepositorioArtefacto } from '../../../shared/models/VersionRepositorioArtefacto';

export const repositorioArtefactosService = {
  consultarRepositoriosAdministrador: (
    req: ConsultaCriteriaRequest,
  ): Promise<Page<RepositorioArtefacto>> =>
    apiClient
      .post<Page<RepositorioArtefacto>>('/repositorio-artefactos/administrador', req)
      .then((r) => r.data),

  consultarVersionesRepositorio: (repositorioId: string): Promise<VersionRepositorioArtefacto[]> =>
    apiClient
      .get<VersionRepositorioArtefacto[]>(`/repositorio-artefactos/${repositorioId}/versiones`)
      .then((r) => r.data),

  generarRepositorio: (
    req: GenerarRepositorioArtefactoRequest,
  ): Promise<GenerarRepositorioArtefactoResponse> =>
    apiClient
      .post<GenerarRepositorioArtefactoResponse>('/repositorio-artefactos', req)
      .then((r) => r.data),

  modificarRepositorio: (
    repositorioId: string,
    req: ModificarRepositorioArtefactoRequest,
  ): Promise<void> =>
    apiClient.patch<void>(`/repositorio-artefactos/${repositorioId}`, req).then(() => undefined),

  solicitarCargaVersion: (
    repositorioId: string,
    req: SolicitarCargaVersionRequest,
  ): Promise<SolicitarCargaVersionResponse> =>
    apiClient
      .post<SolicitarCargaVersionResponse>(
        `/repositorio-artefactos/${repositorioId}/versiones/cargas`,
        req,
      )
      .then((r) => r.data),

  cargarArchivoVersion: (
    carga: SolicitarCargaVersionResponse,
    archivo: File,
    onProgreso?: (porcentaje: number) => void,
  ): Promise<void> => {
    const formData = new FormData();
    for (const [nombre, valor] of Object.entries(carga.campos)) formData.append(nombre, valor);
    formData.append('file', archivo);
    return apiClient
      .post<void>(carga.url, formData, {
        _sinCredenciales: true,
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: ({ loaded, total }) => {
          if (total) onProgreso?.(Math.round((loaded / total) * 100));
        },
      })
      .then(() => undefined);
  },

  subirVersion: (repositorioId: string, req: SubirVersionRequest): Promise<SubirVersionResponse> =>
    apiClient
      .post<SubirVersionResponse>(`/repositorio-artefactos/${repositorioId}/versiones`, req)
      .then((r) => r.data),
};
