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
});
