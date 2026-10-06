import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../../api/axiosInstance';
import { solicitudesService } from './solicitudesService';

vi.mock('../../../api/axiosInstance', () => ({
  default: { post: vi.fn() },
}));

const post = vi.mocked(apiClient.post);

describe('solicitudesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('enviarSolicitudNovedadCoordinador', () => {
    it('llama POST /solicitudes/novedad-coordinador con { destinatario, mensajeSolicitud } y resuelve { id }', async () => {
      // Arrange
      post.mockResolvedValue({ status: 201, data: { id: 's-1' } });

      // Act
      const resultado = await solicitudesService.enviarSolicitudNovedadCoordinador({
        destinatario: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
        mensajeSolicitud: 'No he podido contactar a mi asesor.',
      });

      // Assert
      expect(post).toHaveBeenCalledWith('/solicitudes/novedad-coordinador', {
        destinatario: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
        mensajeSolicitud: 'No he podido contactar a mi asesor.',
      });
      expect(resultado).toEqual({ id: 's-1' });
    });
  });

  describe('enviarSolicitudNovedadAsesor', () => {
    it('llama POST /solicitudes/novedad-asesor con { destinatario, mensajeSolicitud } y resuelve { id }', async () => {
      // Arrange
      post.mockResolvedValue({ status: 201, data: { id: 's-2' } });

      // Act
      const resultado = await solicitudesService.enviarSolicitudNovedadAsesor({
        destinatario: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
        mensajeSolicitud: 'Mi asesor no ha respondido.',
      });

      // Assert
      expect(post).toHaveBeenCalledWith('/solicitudes/novedad-asesor', {
        destinatario: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
        mensajeSolicitud: 'Mi asesor no ha respondido.',
      });
      expect(resultado).toEqual({ id: 's-2' });
    });
  });

  describe('consultarSolicitudesNovedadCoordinadorEnviadas', () => {
    const pagina = {
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
      empty: true,
    };

    it('llama POST /solicitudes/novedad-coordinador/enviadas con { pagina, tamanio } y resuelve la página', async () => {
      // Arrange
      post.mockResolvedValue({ status: 200, data: pagina });

      // Act
      const resultado = await solicitudesService.consultarSolicitudesNovedadCoordinadorEnviadas(
        2,
        10,
      );

      // Assert
      expect(post).toHaveBeenCalledWith('/solicitudes/novedad-coordinador/enviadas', {
        pagina: 2,
        tamanio: 10,
      });
      expect(resultado).toEqual(pagina);
    });
  });
});
