import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import { Rol } from '../../../shared/models/rol';
import type { AgregarRolUsuarioRequest } from '../models/AgregarRolUsuarioRequest';
import type { Coordinador } from '../models/Coordinador';
import type { ConsultarUsuariosRequest } from '../models/ConsultarUsuariosRequest';
import type { Estudiante } from '../models/Estudiante';
import type { ModificarUsuarioRequest } from '../models/ModificarUsuarioRequest';
import type { RegistrarUsuarioRequest } from '../models/RegistrarUsuarioRequest';
import type { Usuario } from '../models/Usuario';
import type { UsuarioRegistradoResponse } from '../models/UsuarioRegistradoResponse';

export const usuariosService = {
  registrarUsuario: (req: RegistrarUsuarioRequest): Promise<UsuarioRegistradoResponse> =>
    apiClient.post<UsuarioRegistradoResponse>('/usuarios', req).then((r) => r.data),

  modificarUsuario: (usuarioId: string, req: ModificarUsuarioRequest): Promise<void> =>
    apiClient.patch<void>(`/usuarios/${usuarioId}`, req).then(() => undefined),

  agregarCoordinador: (usuarioId: string): Promise<void> =>
    apiClient
      .patch<void>(`/usuarios/${usuarioId}`, {
        roles: [Rol.Coordinador],
      } satisfies AgregarRolUsuarioRequest)
      .then(() => undefined),

  removerCoordinador: (usuarioId: string): Promise<void> =>
    apiClient.delete<void>(`/usuarios/${usuarioId}/coordinador`).then(() => undefined),

  eliminarUsuario: (usuarioId: string): Promise<void> =>
    apiClient.delete<void>(`/usuarios/${usuarioId}`).then(() => undefined),

  consultarUsuariosAdministrador: (req: ConsultarUsuariosRequest): Promise<Page<Usuario>> =>
    apiClient.post<Page<Usuario>>('/usuarios/administrador', req).then((r) => r.data),

  consultarCoordinadoresAdministrador: (page = 0, size = 10): Promise<Page<Coordinador>> =>
    apiClient
      .post<Page<Coordinador>>('/usuarios/coordinadores/administrador', {
        pagina: page,
        tamanio: size,
      })
      .then((r) => r.data),

  consultarEstudiantesAdministrador: (page = 0, size = 10): Promise<Page<Estudiante>> =>
    apiClient
      .post<Page<Estudiante>>('/usuarios/estudiantes/administrador', {
        pagina: page,
        tamanio: size,
      })
      .then((r) => r.data),
};
