import apiClient from '../../../api/axiosInstance';
import type { EstadoRevisionAsesor } from '../models/artefactos';
import type { EstudianteArtefacto } from '../models/EstudianteArtefacto';

export const artefactosService = {
  getEstadosRevisionAsesor: (): Promise<EstadoRevisionAsesor[]> =>
    apiClient.get<EstadoRevisionAsesor[]>('/estados-revision-asesor').then((r) => r.data),

  getEstudiantesArtefacto: (artefactoId: string): Promise<EstudianteArtefacto[]> =>
    apiClient
      .get<EstudianteArtefacto[]>(`/artefactos/${artefactoId}/estudiantes`)
      .then((r) => r.data),
};
