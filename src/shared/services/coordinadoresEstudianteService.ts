import apiClient from '../../api/axiosInstance';
import type { CoordinadorProyecto } from '../models/CoordinadorProyecto';

export const coordinadoresEstudianteService = {
  consultarCoordinadores: (): Promise<CoordinadorProyecto[]> =>
    apiClient
      .get<CoordinadorProyecto[]>('/proyectos-grado/estudiante/coordinadores')
      .then((r) => r.data),
};
