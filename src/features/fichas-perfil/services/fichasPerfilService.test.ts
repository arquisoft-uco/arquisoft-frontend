import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../../api/axiosInstance';
import { fichasPerfilService } from './fichasPerfilService';

vi.mock('../../../api/axiosInstance', () => ({
  default: { patch: vi.fn(), post: vi.fn() },
}));

const patch = vi.mocked(apiClient.patch);
const post = vi.mocked(apiClient.post);

describe('fichasPerfilService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registrarFichaPerfil', () => {
    it('traduce la solicitud a POST /fichas-perfil con { tituloProyecto, asesorFicha, estudiantes } y resuelve { id }', async () => {
      // Arrange
      post.mockResolvedValue({ status: 201, data: { id: 'f-9' } });

      // Act
      const resultado = await fichasPerfilService.registrarFichaPerfil({
        tituloProyecto: 'Sistema de monitoreo',
        asesorFichaId: 'a-2',
        estudiantesIds: ['e-1', 'e-2'],
      });

      // Assert
      expect(post).toHaveBeenCalledWith('/fichas-perfil', {
        tituloProyecto: 'Sistema de monitoreo',
        asesorFicha: 'a-2',
        estudiantes: ['e-1', 'e-2'],
      });
      expect(resultado).toEqual({ id: 'f-9' });
    });
  });

  describe('cambiarAsesor', () => {
    it('traduce la solicitud a PATCH /fichas-perfil/{id}/asesor-ficha con { asesorFicha } y resuelve sin cuerpo', async () => {
      // Arrange
      patch.mockResolvedValue({ status: 204, data: '' });

      // Act
      const resultado = await fichasPerfilService.cambiarAsesor({
        idFicha: 'f-1',
        idAsesorFicha: 'a-2',
      });

      // Assert
      expect(patch).toHaveBeenCalledWith('/fichas-perfil/f-1/asesor-ficha', {
        asesorFicha: 'a-2',
      });
      expect(resultado).toBeUndefined();
    });
  });
});
