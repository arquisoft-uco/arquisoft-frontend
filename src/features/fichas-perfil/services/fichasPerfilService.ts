import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import type { Asesor } from '../models/Asesor';
import type { AsignarEstudianteRequest } from '../models/AsignarEstudianteRequest';
import type { AsignarEstudianteResponse } from '../models/AsignarEstudianteResponse';
import type { CambiarAsesorRequest } from '../models/CambiarAsesorRequest';
import type { Estudiante } from '../models/Estudiante';
import type { EstudianteVinculado } from '../models/EstudianteVinculado';
import type { FichaPerfilCreadaResponse } from '../models/FichaPerfilCreadaResponse';
import type { FichaPerfil } from '../models/FichaPerfil';
import type { RegistrarFichaPerfilRequest } from '../models/RegistrarFichaPerfilRequest';
import type { MiFichaPerfilResponse } from '../models/MiFichaPerfilResponse';
import type { ModificarFichaPerfilRequest } from '../models/ModificarFichaPerfilRequest';
import type { Item, TipoItem, CrearItemRequest, ItemCreadoResponse, ModificarItemRequest } from '../models/fichas-perfil';

export const fichasPerfilService = {
  getMiFichaPerfil: (): Promise<MiFichaPerfilResponse> =>
    apiClient
      .get<MiFichaPerfilResponse>('/fichas-perfil/estudiante/mi-ficha')
      .then((r) => r.data),

  modificarTituloFichaPerfil: (req: ModificarFichaPerfilRequest): Promise<void> =>
    apiClient
      .put('/fichas-perfil/estudiante/mi-ficha', req)
      .then(() => undefined),

  consultarItemsMiFichaPerfil: (): Promise<Item[]> =>
    apiClient
      .get<Item[]>('/fichas-perfil/estudiante/mi-ficha/items')
      .then((r) => r.data),

  agregarItemFichaPerfil: (req: CrearItemRequest): Promise<ItemCreadoResponse> =>
    apiClient
      .post<ItemCreadoResponse>('/fichas-perfil/estudiante/mi-ficha/items', req)
      .then((r) => r.data),

  modificarItem: (req: ModificarItemRequest): Promise<void> =>
    apiClient
      .put('/fichas-perfil/estudiante/mi-ficha/items', req)
      .then(() => undefined),

  removerItem: (itemId: string): Promise<void> =>
    apiClient
      .delete(`/fichas-perfil/estudiante/mi-ficha/items/${itemId}`)
      .then(() => undefined),

  consultarTodosTipoItem: (): Promise<TipoItem[]> =>
    apiClient
      .get<TipoItem[]>('/tipos-item')
      .then((r) => r.data),

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

  consultarEstudiantesVinculados: (idFichaPerfil: string): Promise<EstudianteVinculado[]> =>
    apiClient
      .get<EstudianteVinculado[]>(`/fichas-perfil/${idFichaPerfil}/estudiantes`)
      .then((r) => r.data),

  asignarEstudiante: (req: AsignarEstudianteRequest): Promise<AsignarEstudianteResponse> =>
    apiClient
      .post<AsignarEstudianteResponse>('/fichas-perfil/estudiantes', req)
      .then((r) => r.data),

  removerEstudiante: (idVinculo: string): Promise<void> =>
    apiClient
      .delete(`/fichas-perfil/estudiantes/${idVinculo}`)
      .then(() => undefined),

  cambiarAsesor: (req: CambiarAsesorRequest): Promise<void> =>
    apiClient
      .put('/fichas-perfil/asesor', req)
      .then(() => undefined),
};
