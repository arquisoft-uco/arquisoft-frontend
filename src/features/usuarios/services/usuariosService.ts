import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import type { Rol } from '../../../shared/models/rol';
import type { AgregarRolUsuarioRequest } from '../models/AgregarRolUsuarioRequest';
import type { CambiarEstadoUsuarioRequest } from '../models/CambiarEstadoUsuarioRequest';
import type { ConsultarUsuariosRequest } from '../models/ConsultarUsuariosRequest';
import type { EstadoUsuario } from '../models/EstadoUsuario';
import type { IdentidadUsuario } from '../models/IdentidadUsuario';
import type { ModificarUsuarioRequest } from '../models/ModificarUsuarioRequest';
import type { RegistrarUsuarioRequest } from '../models/RegistrarUsuarioRequest';
import type { Usuario } from '../models/Usuario';
import type { UsuarioRegistradoResponse } from '../models/UsuarioRegistradoResponse';

export const usuariosService = {
  registrarUsuario: (req: RegistrarUsuarioRequest): Promise<UsuarioRegistradoResponse> =>
    apiClient.post<UsuarioRegistradoResponse>('/usuarios', req).then((r) => r.data),

  modificarUsuario: (usuarioId: string, req: ModificarUsuarioRequest): Promise<void> =>
    apiClient.patch<void>(`/usuarios/${usuarioId}`, req).then(() => undefined),

  cambiarEstadoUsuario: (usuarioId: string, req: CambiarEstadoUsuarioRequest): Promise<void> =>
    apiClient.patch<void>(`/usuarios/${usuarioId}/estado`, req).then(() => undefined),

  agregarRol: (usuarioId: string, rol: Rol): Promise<void> =>
    apiClient
      .patch<void>(`/usuarios/${usuarioId}`, { roles: [rol] } satisfies AgregarRolUsuarioRequest)
      .then(() => undefined),

  removerCoordinador: (usuarioId: string): Promise<void> =>
    apiClient.delete<void>(`/usuarios/${usuarioId}/coordinador`).then(() => undefined),

  removerEstudiante: (usuarioId: string): Promise<void> =>
    apiClient.delete<void>(`/usuarios/${usuarioId}/estudiante`).then(() => undefined),

  removerAsesor: (usuarioId: string): Promise<void> =>
    apiClient.delete<void>(`/usuarios/${usuarioId}/asesor`).then(() => undefined),

  removerAsesorFicha: (usuarioId: string): Promise<void> =>
    apiClient.delete<void>(`/usuarios/${usuarioId}/asesor-ficha`).then(() => undefined),

  removerRepresentanteComite: (usuarioId: string): Promise<void> =>
    apiClient.delete<void>(`/usuarios/${usuarioId}/representante-comite`).then(() => undefined),

  removerAdministrador: (usuarioId: string): Promise<void> =>
    apiClient.delete<void>(`/usuarios/${usuarioId}/administrador`).then(() => undefined),

  removerBibliotecario: (usuarioId: string): Promise<void> =>
    apiClient.delete<void>(`/usuarios/${usuarioId}/bibliotecario`).then(() => undefined),

  eliminarUsuario: (usuarioId: string): Promise<void> =>
    apiClient.delete<void>(`/usuarios/${usuarioId}`).then(() => undefined),

  consultarUsuariosAdministrador: (req: ConsultarUsuariosRequest): Promise<Page<Usuario>> =>
    apiClient.post<Page<Usuario>>('/usuarios/administrador', req).then((r) => r.data),

  consultarIdentidadUsuario: (usuarioId: string): Promise<IdentidadUsuario> =>
    apiClient.get<IdentidadUsuario>(`/usuarios/${usuarioId}`).then((r) => r.data),

  getEstadosUsuario: (): Promise<EstadoUsuario[]> =>
    apiClient.get<EstadoUsuario[]>('/usuarios/estados').then((r) => r.data),
};
