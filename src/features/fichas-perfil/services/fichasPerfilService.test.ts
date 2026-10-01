import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../../api/axiosInstance';
import { fichasPerfilService } from './fichasPerfilService';

vi.mock('../../../api/axiosInstance', () => ({
  default: { get: vi.fn(), patch: vi.fn(), post: vi.fn() },
}));

const get = vi.mocked(apiClient.get);
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
  describe('consultarFichasPerfilEstudiante', () => {
    it('consulta GET /fichas-perfil/estudiante y traduce cada DTO de la lista al modelo del frontend', async () => {
      // Arrange
      get.mockResolvedValue({
        status: 200,
        data: [{
          idFichaPerfil: 'f-1',
          titulo: 'Sistema de monitoreo',
          asesor: { id: 'a-1', identificador: 'ASE-1', nombre: 'Ana Ruiz', email: 'ana@uco.edu.co' },
          estado: { id: 'st-1', nombre: 'En revisión', fechaActualizacion: '2026-09-01T10:00:00' },
          estudiantes: [
            {
              id: 'v-1',
              fichaPerfilId: 'f-1',
              estudianteId: 'e-1',
              nombre: 'Luis Pérez',
              email: 'luis@uco.edu.co',
              vigente: true,
            },
          ],
        }],
      });

      // Act
      const resultado = await fichasPerfilService.consultarFichasPerfilEstudiante();

      // Assert
      expect(get).toHaveBeenCalledWith('/fichas-perfil/estudiante');
      expect(resultado).toEqual([{
        id: 'f-1',
        tituloProyecto: 'Sistema de monitoreo',
        asesor: { id: 'a-1', nombre: 'Ana Ruiz', email: 'ana@uco.edu.co' },
        estadoActual: { id: 'st-1', nombre: 'En revisión', fechaActualizacion: '2026-09-01T10:00:00' },
        integrantes: [{ id: 'e-1', nombre: 'Luis Pérez', email: 'luis@uco.edu.co' }],
      }]);
    });

    it('devuelve una lista vacía cuando el backend responde []', async () => {
      // Arrange
      get.mockResolvedValue({ status: 200, data: [] });

      // Act
      const resultado = await fichasPerfilService.consultarFichasPerfilEstudiante();

      // Assert
      expect(resultado).toEqual([]);
    });
  });

  describe('consultarCompanerosFichaPerfil', () => {
    it('consulta GET /fichas-perfil/{id}/estudiantes/companeros y traduce id a idVinculo y estudianteId a id', async () => {
      // Arrange
      get.mockResolvedValue({
        status: 200,
        data: [
          {
            id: 'v-2',
            fichaPerfilId: 'f-1',
            estudianteId: 'e-2',
            nombre: 'Marta Gómez',
            email: 'marta@uco.edu.co',
            vigente: true,
          },
        ],
      });

      // Act
      const resultado = await fichasPerfilService.consultarCompanerosFichaPerfil('f-1');

      // Assert
      expect(get).toHaveBeenCalledWith('/fichas-perfil/f-1/estudiantes/companeros');
      expect(resultado).toEqual([
        { idVinculo: 'v-2', id: 'e-2', nombre: 'Marta Gómez', email: 'marta@uco.edu.co' },
      ]);
    });
  });

  describe('consultarItemsMiFichaPerfil', () => {
    it('consulta GET /fichas-perfil/{id}/items/estudiante y traduce el ítem plano al modelo anidado', async () => {
      // Arrange
      get.mockResolvedValue({
        status: 200,
        data: [{ id: 'i-1', fichaPerfilId: 'f-1', tipoItem: 't-1', tipoItemNombre: 'Objetivo', contenido: 'Medir' }],
      });

      // Act
      const resultado = await fichasPerfilService.consultarItemsMiFichaPerfil('f-1');

      // Assert
      expect(get).toHaveBeenCalledWith('/fichas-perfil/f-1/items/estudiante');
      expect(resultado).toEqual([
        { id: 'i-1', fichaPerfilId: 'f-1', tipoItem: { id: 't-1', nombre: 'Objetivo' }, contenido: 'Medir' },
      ]);
    });
  });
});
