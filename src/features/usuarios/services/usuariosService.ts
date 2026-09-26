import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import type { Coordinador } from '../models/Coordinador';
import type { RegistrarUsuarioRequest } from '../models/RegistrarUsuarioRequest';
import type { UsuarioRegistradoResponse } from '../models/UsuarioRegistradoResponse';

export const usuariosService = {
  registrarUsuario: (req: RegistrarUsuarioRequest): Promise<UsuarioRegistradoResponse> =>
    apiClient.post<UsuarioRegistradoResponse>('/usuarios', req).then((r) => r.data),

  consultarCoordinadoresAdministrador: (page = 0, size = 10): Promise<Page<Coordinador>> =>
    apiClient
      .post<Page<Coordinador>>('/usuarios/coordinadores/administrador', {
        pagina: page,
        tamanio: size,
      })
      .then((r) => r.data),
};
