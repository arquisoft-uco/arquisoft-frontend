import apiClient from '../../api/axiosInstance';
import type { EnlaceDescargaVersion } from '../models/EnlaceDescargaVersion';

export const descargaVersionRepositorioService = {
  obtenerEnlace: (versionRepositorioArtefactoId: string): Promise<EnlaceDescargaVersion> =>
    apiClient
      .get<EnlaceDescargaVersion>(
        `/repositorio-artefactos/versiones/${versionRepositorioArtefactoId}/descarga`,
      )
      .then((r) => r.data),

  obtenerEnlaceVersionArtefacto: (versionArtefactoId: string): Promise<EnlaceDescargaVersion> =>
    apiClient
      .get<EnlaceDescargaVersion>(`/artefactos/versiones/${versionArtefactoId}/descarga`)
      .then((r) => r.data),
};
