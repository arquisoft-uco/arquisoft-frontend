import apiClient from '../../api/axiosInstance';
import type { ProyectoGradoEstudiante } from '../models/ProyectoGradoEstudiante';

export const misProyectosGradoService = {
  consultar: (): Promise<ProyectoGradoEstudiante[]> =>
    apiClient.get<ProyectoGradoEstudiante[]>('/proyectos-grado/estudiante').then((r) => r.data),
};
