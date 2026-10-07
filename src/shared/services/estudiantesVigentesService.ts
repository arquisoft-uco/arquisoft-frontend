import apiClient from '../../api/axiosInstance';
import type { Page } from '../models/api-response';
import type { EstudianteVigente } from '../models/EstudianteVigente';

// Forma cruda del backend para POST /usuarios/estudiantes/vigentes;
// se descartan identificador/contacto/estado al traducir a EstudianteVigente (ningún consumidor los usa hoy).
interface EstudianteVigenteResponseDTO {
  id: string;
  identificador: string;
  nombre: string;
  email: string;
  contacto: string;
  estado: string;
}

const TAMANIO_PAGINA_ESTUDIANTES = 100;

export const estudiantesVigentesService = {
  consultarVigentes: (): Promise<EstudianteVigente[]> =>
    apiClient
      .post<Page<EstudianteVigenteResponseDTO>>('/usuarios/estudiantes/vigentes', {
        pagina: 0,
        tamanio: TAMANIO_PAGINA_ESTUDIANTES,
        ordenamiento: ['nombre:ASC'],
        filtros: { tipo: 'PREDICADO', campo: 'estado', operador: 'ES', valor: 'ACTIVO' },
      })
      .then((r) => r.data.content.map((dto) => ({ id: dto.id, nombre: dto.nombre, email: dto.email }))),
};
