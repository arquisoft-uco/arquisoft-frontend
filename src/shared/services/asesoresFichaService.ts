import apiClient from '../../api/axiosInstance';
import type { Page } from '../models/api-response';
import type { Asesor } from '../models/Asesor';

// Forma cruda del backend para POST /usuarios/asesores-ficha/vigentes;
// se descartan identificador/contacto/estado al traducir a Asesor (ningún consumidor los usa hoy).
interface AsesorFichaVigenteResponseDTO {
  id: string;
  identificador: string;
  nombre: string;
  email: string;
  contacto: string;
  estado: string;
}

const TAMANIO_PAGINA_ASESORES = 100;

export const asesoresFichaService = {
  consultarVigentes: (): Promise<Asesor[]> =>
    apiClient
      .post<Page<AsesorFichaVigenteResponseDTO>>('/usuarios/asesores-ficha/vigentes', {
        pagina: 0,
        tamanio: TAMANIO_PAGINA_ASESORES,
        ordenamiento: ['nombre:ASC'],
        filtros: { tipo: 'PREDICADO', campo: 'estado', operador: 'ES', valor: 'ACTIVO' },
      })
      .then((r) => r.data.content.map((dto) => ({ id: dto.id, nombre: dto.nombre, email: dto.email }))),
};
