import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../../api/axiosInstance';
import { artefactosService } from './artefactosService';

vi.mock('../../../api/axiosInstance', () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn(), patch: vi.fn() },
}));

const get = vi.mocked(apiClient.get);
const post = vi.mocked(apiClient.post);
const eliminar = vi.mocked(apiClient.delete);
const patch = vi.mocked(apiClient.patch);

describe('artefactosService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('cambiarVersionRepositorioArtefacto', () => {
    it('hace PATCH /artefactos/{id}/version-repositorio traduciendo versionRepositorioId y resuelve sin valor', async () => {
      // Arrange
      patch.mockResolvedValue({ data: undefined });

      // Act
      const resultado = await artefactosService.cambiarVersionRepositorioArtefacto({
        artefactoId: 'art-1',
        versionRepositorioId: 'v-9',
      });

      // Assert
      expect(patch).toHaveBeenCalledWith('/artefactos/art-1/version-repositorio', {
        versionRepositorioArtefacto: 'v-9',
      });
      expect(resultado).toBeUndefined();
    });
  });

  describe('cambiarAsesorArtefacto', () => {
    it('hace PATCH /artefactos/{id}/asesor traduciendo asesorId a asesor y resuelve sin valor', async () => {
      // Arrange
      patch.mockResolvedValue({ data: undefined });

      // Act
      const resultado = await artefactosService.cambiarAsesorArtefacto({
        artefactoId: 'art-1',
        asesorId: 'a-2',
      });

      // Assert
      expect(patch).toHaveBeenCalledWith('/artefactos/art-1/asesor', { asesor: 'a-2' });
      expect(resultado).toBeUndefined();
    });
  });

  describe('marcarRevisionResuelta', () => {
    it('hace PATCH /artefactos/revisiones/{id}/estado con el estado RESUELTA y resuelve sin valor', async () => {
      // Arrange
      patch.mockResolvedValue({ data: undefined });

      // Act
      const resultado = await artefactosService.marcarRevisionResuelta({ revisionAsesorId: 'r-1' });

      // Assert
      expect(patch).toHaveBeenCalledWith('/artefactos/revisiones/r-1/estado', {
        estado: 'RESUELTA',
      });
      expect(resultado).toBeUndefined();
    });
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

  describe('getVersionArtefacto', () => {
    it('hace GET a /artefactos/versiones/{id} y devuelve data', async () => {
      // Arrange
      const version = { id: 'v-1', version: 2 };
      get.mockResolvedValue({ data: version });

      // Act
      const resultado = await artefactosService.getVersionArtefacto('v-1');

      // Assert
      expect(get).toHaveBeenCalledWith('/artefactos/versiones/v-1');
      expect(resultado).toBe(version);
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

  describe('asignación de artefacto (HU-102)', () => {
    it('asignarArtefacto envía POST /artefactos con los tres nombres del DTO', async () => {
      // Arrange
      post.mockResolvedValue({ data: { id: 'a-1' } });

      // Act
      const resultado = await artefactosService.asignarArtefacto({
        proyectoGrado: 'p-1',
        versionRepositorioArtefacto: 'v-1',
        estudiantes: ['e-1'],
      });

      // Assert
      expect(post).toHaveBeenCalledWith('/artefactos', {
        proyectoGrado: 'p-1',
        versionRepositorioArtefacto: 'v-1',
        estudiantes: ['e-1'],
      });
      expect(resultado).toEqual({ id: 'a-1' });
    });

    it('consultarProyectosAsignables traduce tituloProyecto a titulo y calcula la página siguiente', async () => {
      // Arrange
      post.mockResolvedValueOnce({
        data: { content: [{ id: 'p-1', tituloProyecto: 'Riego' }], page: 0, last: false },
      });
      post.mockResolvedValueOnce({ data: { content: [], page: 1, last: true } });

      // Act
      const primera = await artefactosService.consultarProyectosAsignables(0);
      const ultima = await artefactosService.consultarProyectosAsignables(1);

      // Assert
      expect(post).toHaveBeenNthCalledWith(1, '/proyectos-grado/asesor', {
        pagina: 0,
        tamanio: 100,
        ordenamiento: ['tituloProyecto:ASC'],
      });
      expect(primera).toEqual({ proyectos: [{ id: 'p-1', titulo: 'Riego' }], siguientePagina: 1 });
      expect(ultima.siguientePagina).toBeNull();
    });
  });

  describe('omisión de artefacto (HU-103)', () => {
    it('omitirArtefacto envía DELETE /artefactos/{id} sin body y resuelve undefined', async () => {
      // Arrange
      eliminar.mockResolvedValue({ data: undefined, status: 204 });

      // Act
      const resultado = await artefactosService.omitirArtefacto('a-1');

      // Assert
      expect(eliminar).toHaveBeenCalledWith('/artefactos/a-1');
      expect(resultado).toBeUndefined();
    });
  });

  describe('observaciones de una revisión (HU-134)', () => {
    it('registrarObservacion envía POST con exactamente { descripcion } y devuelve { id }', async () => {
      // Arrange
      post.mockResolvedValue({ data: { id: 'o-1' } });

      // Act
      const resultado = await artefactosService.registrarObservacion('r-1', {
        descripcion: 'Falta el diagrama',
      });

      // Assert
      expect(post).toHaveBeenCalledWith('/artefactos/revisiones/r-1/observaciones', {
        descripcion: 'Falta el diagrama',
      });
      expect(resultado).toEqual({ id: 'o-1' });
    });
  });

  describe('cambiar estado de una observación (HU-137)', () => {
    it('cambiarEstadoObservacion envía PATCH con { estado } a la ruta de estado-asesor y resuelve undefined', async () => {
      // Arrange
      patch.mockResolvedValue({ status: 204 });

      // Act
      const resultado = await artefactosService.cambiarEstadoObservacion('o-1', {
        estado: 'REABIERTA',
      });

      // Assert
      expect(patch).toHaveBeenCalledWith('/artefactos/observaciones/o-1/estado-asesor', {
        estado: 'REABIERTA',
      });
      expect(resultado).toBeUndefined();
    });
  });

  describe('cambiar estado de una observación del estudiante (HU-021)', () => {
    it('cambiarEstadoObservacionEstudiante envía PATCH con { estado } a estado-estudiante y resuelve undefined', async () => {
      // Arrange
      patch.mockResolvedValue({ status: 204 });

      // Act
      const resultado = await artefactosService.cambiarEstadoObservacionEstudiante('o-1', {
        estado: 'SOLUCIONADA',
      });

      // Assert
      expect(patch).toHaveBeenCalledWith('/artefactos/observaciones/o-1/estado-estudiante', {
        estado: 'SOLUCIONADA',
      });
      expect(resultado).toBeUndefined();
    });
  });

  describe('enviar revisión (HU-292)', () => {
    it('enviarRevision envía PATCH sin body a la ruta de envío y resuelve undefined', async () => {
      // Arrange
      patch.mockResolvedValue({ status: 204 });

      // Act
      const resultado = await artefactosService.enviarRevision('r-1');

      // Assert
      expect(patch).toHaveBeenCalledWith('/artefactos/revisiones/r-1/envio');
      expect(resultado).toBeUndefined();
    });
  });

  describe('registrar revisión (HU-114)', () => {
    it('registrarRevision envía POST sin body a la ruta de revisiones de la versión y devuelve { id }', async () => {
      // Arrange
      post.mockResolvedValue({ data: { id: 'r-1' } });

      // Act
      const resultado = await artefactosService.registrarRevision('v-1');

      // Assert
      expect(post).toHaveBeenCalledWith('/artefactos/versiones/v-1/revisiones');
      expect(resultado).toEqual({ id: 'r-1' });
    });

    it('getIdsArtefactosOmitidosAsesor recorre las páginas hasta la última y devuelve solo los omitidos', async () => {
      // Arrange
      post
        .mockResolvedValueOnce({
          data: {
            content: [
              { id: 'a-1', omitido: true },
              { id: 'a-2', omitido: false },
            ],
            last: false,
          },
        })
        .mockResolvedValueOnce({ data: { content: [{ id: 'a-3', omitido: true }], last: true } });

      // Act
      const ids = await artefactosService.getIdsArtefactosOmitidosAsesor();

      // Assert
      expect(post).toHaveBeenNthCalledWith(1, '/artefactos/asesor', {
        pagina: 0,
        tamanio: 100,
        ordenamiento: ['nombreProyecto:ASC'],
      });
      expect(post).toHaveBeenNthCalledWith(
        2,
        '/artefactos/asesor',
        expect.objectContaining({ pagina: 1 }),
      );
      expect(ids).toEqual(['a-1', 'a-3']);
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

  describe('vincular estudiantes (HU-106)', () => {
    it('vincularEstudiantes envía solo { estudiantes } a la ruta del artefacto', async () => {
      // Arrange
      post.mockResolvedValue({ data: 'ignorado' });

      // Act
      const vinculado = await artefactosService.vincularEstudiantes('a-1', {
        estudiantes: ['e-1', 'e-2'],
      });

      // Assert
      expect(post).toHaveBeenCalledWith('/artefactos/a-1/estudiantes', {
        estudiantes: ['e-1', 'e-2'],
      });
      expect(vinculado).toBeUndefined();
    });
  });
});
