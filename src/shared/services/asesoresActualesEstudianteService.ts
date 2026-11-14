import apiClient from '../../api/axiosInstance';
import type { AsesorActualProyecto } from '../models/AsesorActualProyecto';

export const asesoresActualesEstudianteService = {
  consultarAsesoresActuales: (): Promise<AsesorActualProyecto[]> =>
    apiClient
      .get<AsesorActualProyecto[]>('/proyectos-grado/estudiante/asesores-actuales')
      .then((r) => r.data),
};
