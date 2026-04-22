import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import type { Asesor } from '../models/Asesor';
import type { Estudiante } from '../models/Estudiante';
import type { FichaPerfilCreadaResponse } from '../models/FichaPerfilCreadaResponse';
import type { FichaPerfil } from '../models/FichaPerfil';
import type { RegistrarFichaPerfilRequest } from '../models/RegistrarFichaPerfilRequest';

export const fichasPerfilService = {
  getFichasCoordinador: (page = 0, size = 10): Promise<Page<FichaPerfil>> =>
    apiClient
      .get<Page<FichaPerfil>>('/fichas-perfil/coordinador', { params: { page, size } })
      .then((r) => r.data),

  consultarAsesoresDisponibles: (): Promise<Asesor[]> =>
    apiClient
      .get<Asesor[]>('/asesores')
      .then((r) => r.data),

  consultarEstudiantesDisponibles: (): Promise<Estudiante[]> =>
    apiClient
      .get<Estudiante[]>('/estudiantes')
      .then((r) => r.data),

  registrarFichaPerfil: (req: RegistrarFichaPerfilRequest): Promise<FichaPerfilCreadaResponse> =>
    apiClient
      .post<FichaPerfilCreadaResponse>('/fichas-perfil', req)
      .then((r) => r.data),
};
