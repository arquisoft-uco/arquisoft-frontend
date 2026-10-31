import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../../api/axiosInstance';
import { artefactosService } from './artefactosService';

vi.mock('../../../api/axiosInstance', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const get = vi.mocked(apiClient.get);
const post = vi.mocked(apiClient.post);

describe('artefactosService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getObservacionesRevision', () => {
    it('consulta GET /revisiones-asesor/{id}/observaciones y traduce revisionAsesor y estado', async () => {
      // Arrange
      get.mockResolvedValue({
        data: [
          {
            id: 'o-1',
            revisionAsesor: 'r-1',
            descripcion: 'Falta el diagrama',
            estado: 'NUEVA',
            estadoNombre: 'Nueva',
          },
        ],
      });

      // Act
      const resultado = await artefactosService.getObservacionesRevision('r-1');

      // Assert
      expect(get).toHaveBeenCalledWith('/revisiones-asesor/r-1/observaciones');
      expect(resultado).toEqual([
        {
          id: 'o-1',
          revisionAsesorId: 'r-1',
          descripcion: 'Falta el diagrama',
          estadoId: 'NUEVA',
          estadoNombre: 'Nueva',
        },
      ]);
    });

    it('devuelve una lista vacía cuando la revisión no tiene observaciones', async () => {
      // Arrange
      get.mockResolvedValue({ data: [] });

      // Act
      const resultado = await artefactosService.getObservacionesRevision('r-1');

      // Assert
      expect(resultado).toEqual([]);
    });
  });

  describe('getObservacionesRevisionEstudiante', () => {
    it('consulta GET /revisiones-asesor/{id}/observaciones/estudiante y traduce revisionAsesor y estado', async () => {
      // Arrange
      get.mockResolvedValue({
        data: [
          {
            id: 'o-1',
            revisionAsesor: 'r-1',
            descripcion: 'Falta el diagrama',
            estado: 'NUEVA',
            estadoNombre: 'Nueva',
          },
        ],
      });

      // Act
      const resultado = await artefactosService.getObservacionesRevisionEstudiante('r-1');

      // Assert
      expect(get).toHaveBeenCalledWith('/revisiones-asesor/r-1/observaciones/estudiante');
      expect(resultado).toEqual([
        {
          id: 'o-1',
          revisionAsesorId: 'r-1',
          descripcion: 'Falta el diagrama',
          estadoId: 'NUEVA',
          estadoNombre: 'Nueva',
        },
      ]);
    });

    it('devuelve una lista vacía cuando la revisión no tiene observaciones', async () => {
      // Arrange
      get.mockResolvedValue({ data: [] });

      // Act
      const resultado = await artefactosService.getObservacionesRevisionEstudiante('r-1');

      // Assert
      expect(resultado).toEqual([]);
    });
  });
  describe('consultas de HU-112', () => {
    it('consultarVersionesArtefactoAsesor hace POST a /versiones-artefacto/asesor y devuelve data', async () => {
      // Arrange
      const req = { pagina: 0, tamanio: 10, ordenamiento: ['fechaCreacion:DESC'] };
      const pagina = { content: [], totalElements: 0 };
      post.mockResolvedValue({ data: pagina });

      // Act
      const resultado = await artefactosService.consultarVersionesArtefactoAsesor(req);

      // Assert
      expect(post).toHaveBeenCalledWith('/versiones-artefacto/asesor', req);
      expect(resultado).toBe(pagina);
    });
  });

  describe('consultas de HU-112-AJ3', () => {
    it('consultarArtefactosAsesor hace POST a /artefactos/asesor y devuelve data', async () => {
      // Arrange
      const req = { pagina: 0, tamanio: 10, ordenamiento: ['nombreProyecto:ASC'] };
      const pagina = { content: [], totalElements: 0 };
      post.mockResolvedValue({ data: pagina });

      // Act
      const resultado = await artefactosService.consultarArtefactosAsesor(req);

      // Assert
      expect(post).toHaveBeenCalledWith('/artefactos/asesor', req);
      expect(resultado).toBe(pagina);
    });
  });

  describe('consultas de HU-044', () => {
    it('consultarVersionesArtefactoEstudiante hace POST a /artefactos/versiones/estudiante y devuelve data', async () => {
      // Arrange
      const req = { pagina: 0, tamanio: 10, ordenamiento: ['fechaCreacion:DESC'] };
      const pagina = { content: [], totalElements: 0 };
      post.mockResolvedValue({ data: pagina });

      // Act
      const resultado = await artefactosService.consultarVersionesArtefactoEstudiante(req);

      // Assert
      expect(post).toHaveBeenCalledWith('/artefactos/versiones/estudiante', req);
      expect(resultado).toBe(pagina);
    });
  });

  describe('consultas de HU-042', () => {
    it('getParticipacionesEstudiante hace GET a /artefactos/estudiante/participaciones y devuelve data', async () => {
      // Arrange
      const lista = [{ id: 'a-1' }];
      get.mockResolvedValue({ data: lista });

      // Act
      const resultado = await artefactosService.getParticipacionesEstudiante();

      // Assert
      expect(get).toHaveBeenCalledWith('/artefactos/estudiante/participaciones');
      expect(resultado).toBe(lista);
    });
  });

  describe('subida de versión (HU-043)', () => {
    it('solicitarCargaVersionArtefacto y generarVersionArtefacto llaman a su ruta con su body y devuelven data', async () => {
      // Arrange
      const solicitud = { nombreArchivo: 'a.md', tipoContenido: 'text/markdown', tamanoBytes: 3 };
      const carga = { carga: 'c-1', url: 'http://minio.test', campos: {}, expiraEn: 'x' };
      const version = { id: 'v-1', version: 2 };
      post.mockResolvedValueOnce({ data: carga }).mockResolvedValueOnce({ data: version });

      // Act
      const cargaObtenida = await artefactosService.solicitarCargaVersionArtefacto(
        'a-1',
        solicitud,
      );
      const versionObtenida = await artefactosService.generarVersionArtefacto('a-1', {
        carga: 'c-1',
      });

      // Assert
      expect(post).toHaveBeenNthCalledWith(1, '/artefactos/a-1/versiones/cargas', solicitud);
      expect(post).toHaveBeenNthCalledWith(2, '/artefactos/a-1/versiones', { carga: 'c-1' });
      expect(cargaObtenida).toBe(carga);
      expect(versionObtenida).toBe(version);
    });
  });
});
