import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../../api/axiosInstance';
import { fichasPerfilService } from './fichasPerfilService';

vi.mock('../../../api/axiosInstance', () => ({
  default: { get: vi.fn(), patch: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

const get = vi.mocked(apiClient.get);
const patch = vi.mocked(apiClient.patch);
const post = vi.mocked(apiClient.post);
const eliminar = vi.mocked(apiClient.delete);

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

  describe('registrarEvaluacion', () => {
    it('hace POST /fichas-perfil/{id}/evaluaciones sin cuerpo y resuelve { id }', async () => {
      // Arrange
      post.mockResolvedValue({ status: 201, data: { id: 'ev-1' } });

      // Act
      const resultado = await fichasPerfilService.registrarEvaluacion({ fichaPerfilId: 'f-1' });

      // Assert
      expect(post).toHaveBeenCalledWith('/fichas-perfil/f-1/evaluaciones');
      expect(resultado).toEqual({ id: 'ev-1' });
    });
  });

  describe('agregarEstadoEvaluacion', () => {
    it('traduce la solicitud a POST /fichas-perfil/estado-evaluacion-ficha con { evaluacionFichaPerfil, estadoEvaluacion } y resuelve { id }', async () => {
      // Arrange
      post.mockResolvedValue({ status: 201, data: { id: 'ee-1' } });

      // Act
      const resultado = await fichasPerfilService.agregarEstadoEvaluacion({
        evaluacionFichaPerfilId: 'ev-1',
        estadoEvaluacionId: 'APROBADA',
      });

      // Assert
      expect(post).toHaveBeenCalledWith('/fichas-perfil/estado-evaluacion-ficha', {
        evaluacionFichaPerfil: 'ev-1',
        estadoEvaluacion: 'APROBADA',
      });
      expect(resultado).toEqual({ id: 'ee-1' });
    });
  });

  describe('agregarEstadoFichaPerfil', () => {
    it('traduce la solicitud a POST /fichas-perfil/{id}/estados-ficha con { estadoFicha } y resuelve { id }', async () => {
      // Arrange
      post.mockResolvedValue({ status: 201, data: { id: 'ef-1' } });

      // Act
      const resultado = await fichasPerfilService.agregarEstadoFichaPerfil('f-1', {
        estadoFichaId: 'DESCARTADA',
      });

      // Assert
      expect(post).toHaveBeenCalledWith('/fichas-perfil/f-1/estados-ficha', {
        estadoFicha: 'DESCARTADA',
      });
      expect(resultado).toEqual({ id: 'ef-1' });
    });
  });

  describe('agregarEstadoAprobacionFichaPerfil', () => {
    it('traduce la solicitud a POST /fichas-perfil/{id}/estados-ficha/aprobacion con { acepta } y resuelve { id }', async () => {
      // Arrange
      post.mockResolvedValue({ status: 201, data: { id: 'ef-2' } });

      // Act
      const resultado = await fichasPerfilService.agregarEstadoAprobacionFichaPerfil('f-1', {
        acepta: false,
      });

      // Assert
      expect(post).toHaveBeenCalledWith('/fichas-perfil/f-1/estados-ficha/aprobacion', {
        acepta: false,
      });
      expect(resultado).toEqual({ id: 'ef-2' });
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
        data: [
          {
            idFichaPerfil: 'f-1',
            titulo: 'Sistema de monitoreo',
            asesor: {
              id: 'a-1',
              identificador: 'ASE-1',
              nombre: 'Ana Ruiz',
              email: 'ana@uco.edu.co',
            },
            estado: {
              id: 'st-1',
              nombre: 'En revisión',
              fechaActualizacion: '2026-09-01T10:00:00',
            },
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
          },
        ],
      });

      // Act
      const resultado = await fichasPerfilService.consultarFichasPerfilEstudiante();

      // Assert
      expect(get).toHaveBeenCalledWith('/fichas-perfil/estudiante');
      expect(resultado).toEqual([
        {
          id: 'f-1',
          tituloProyecto: 'Sistema de monitoreo',
          asesor: { id: 'a-1', nombre: 'Ana Ruiz', email: 'ana@uco.edu.co' },
          estadoActual: {
            id: 'st-1',
            nombre: 'En revisión',
            fechaActualizacion: '2026-09-01T10:00:00',
          },
          integrantes: [{ id: 'e-1', nombre: 'Luis Pérez', email: 'luis@uco.edu.co' }],
        },
      ]);
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
        data: [
          {
            id: 'i-1',
            fichaPerfilId: 'f-1',
            tipoItem: 't-1',
            tipoItemNombre: 'Objetivo',
            contenido: 'Medir',
          },
        ],
      });

      // Act
      const resultado = await fichasPerfilService.consultarItemsMiFichaPerfil('f-1');

      // Assert
      expect(get).toHaveBeenCalledWith('/fichas-perfil/f-1/items/estudiante');
      expect(resultado).toEqual([
        {
          id: 'i-1',
          fichaPerfilId: 'f-1',
          tipoItem: { id: 't-1', nombre: 'Objetivo' },
          contenido: 'Medir',
        },
      ]);
    });
  });

  describe('consultarEvaluacionesMiFichaPerfil', () => {
    it('consulta GET /fichas-perfil/{id}/evaluaciones/estudiante y traduce los nombres del backend al modelo', async () => {
      // Arrange
      get.mockResolvedValue({
        status: 200,
        data: [
          {
            id: 'ev-1',
            fichaPerfil: 'f-1',
            fechaCreacion: '2026-09-01T10:00:00Z',
            estadoEvaluacion: 'DESCARTADA',
            estadoEvaluacionNombre: 'Descartada',
            representanteComite: { id: 'r-1', nombre: 'Rosa Gil' },
          },
        ],
      });

      // Act
      const resultado = await fichasPerfilService.consultarEvaluacionesMiFichaPerfil('f-1');

      // Assert
      expect(get).toHaveBeenCalledWith('/fichas-perfil/f-1/evaluaciones/estudiante');
      expect(resultado).toEqual([
        {
          id: 'ev-1',
          fichaPerfilId: 'f-1',
          fechaCreacion: '2026-09-01T10:00:00Z',
          estadoEvaluacionId: 'DESCARTADA',
          estadoEvaluacionNombre: 'Descartada',
          representante: { id: 'r-1', nombre: 'Rosa Gil' },
        },
      ]);
    });
  });

  describe('consultarObservacionesEvaluacionMiFicha', () => {
    it('consulta GET /fichas-perfil/evaluaciones/{id}/observaciones/estudiante y traduce evaluacionFichaPerfil a evaluacionFichaPerfilId', async () => {
      // Arrange
      get.mockResolvedValue({
        status: 200,
        data: [{ id: 'o-1', evaluacionFichaPerfil: 'ev-1', observacion: 'Ajustar el alcance' }],
      });

      // Act
      const resultado = await fichasPerfilService.consultarObservacionesEvaluacionMiFicha('ev-1');

      // Assert
      expect(get).toHaveBeenCalledWith('/fichas-perfil/evaluaciones/ev-1/observaciones/estudiante');
      expect(resultado).toEqual([
        { id: 'o-1', evaluacionFichaPerfilId: 'ev-1', observacion: 'Ajustar el alcance' },
      ]);
    });
  });

  describe('getEstadosFichasAsesor', () => {
    it('hace POST /fichas-perfil/estados-ficha/asesor con el body recibido y traduce fichaPerfil a fichaPerfilId conservando la paginación', async () => {
      // Arrange
      const req = {
        pagina: 1,
        tamanio: 10,
        ordenamiento: ['tituloProyecto:ASC'],
        filtros: {
          tipo: 'PREDICADO' as const,
          campo: 'estadoFicha',
          operador: 'ES',
          valor: 'st-1',
        },
      };
      post.mockResolvedValue({
        status: 200,
        data: {
          content: [
            {
              fichaPerfil: 'f-1',
              tituloProyecto: 'Sistema de monitoreo',
              estadoId: 'st-1',
              estadoNombre: 'En revisión',
              fechaActualizacion: '2026-09-01T10:00:00',
            },
          ],
          page: 1,
          size: 10,
          totalElements: 11,
          totalPages: 2,
          first: false,
          last: true,
          empty: false,
        },
      });

      // Act
      const resultado = await fichasPerfilService.getEstadosFichasAsesor(req);

      // Assert
      expect(post).toHaveBeenCalledWith('/fichas-perfil/estados-ficha/asesor', req);
      expect(resultado.content).toEqual([
        {
          fichaPerfilId: 'f-1',
          tituloProyecto: 'Sistema de monitoreo',
          estadoId: 'st-1',
          estadoNombre: 'En revisión',
          fechaActualizacion: '2026-09-01T10:00:00',
        },
      ]);
      expect(resultado).toMatchObject({
        page: 1,
        size: 10,
        totalElements: 11,
        totalPages: 2,
        last: true,
      });
    });
  });

  describe('getFichasCoordinador', () => {
    it('hace POST /fichas-perfil/coordinador con el criterio recibido y resuelve la página', async () => {
      // Arrange
      const pagina = { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 };
      const req = {
        pagina: 0,
        tamanio: 10,
        ordenamiento: ['tituloProyecto:ASC'],
        filtros: {
          tipo: 'PREDICADO' as const,
          campo: 'tituloProyecto',
          operador: 'CONTIENE',
          valor: 'monitoreo',
        },
      };
      post.mockResolvedValue({ status: 200, data: pagina });

      // Act
      const resultado = await fichasPerfilService.getFichasCoordinador(req);

      // Assert
      expect(post).toHaveBeenCalledWith('/fichas-perfil/coordinador', req);
      expect(resultado).toEqual(pagina);
    });
  });

  describe('removerEstudiante', () => {
    it('hace DELETE /fichas-perfil/{id}/estudiantes/{estudianteId} y resuelve sin cuerpo', async () => {
      // Arrange
      eliminar.mockResolvedValue({ status: 204, data: undefined });

      // Act
      const resultado = await fichasPerfilService.removerEstudiante('f-1', 'e-1');

      // Assert
      expect(eliminar).toHaveBeenCalledWith('/fichas-perfil/f-1/estudiantes/e-1');
      expect(resultado).toBeUndefined();
    });
  });

  describe('getFichasRepresentante', () => {
    const vacios = { titulo: '', asesorNombre: '', asesorEmail: '', estadoIds: [] };
    const paginaDto = {
      content: [
        {
          id: 'f-1',
          tituloProyecto: 'Sistema de monitoreo',
          asesorFicha: {
            id: 'a-1',
            identificador: 'ASE-1',
            nombre: 'Ana Ruiz',
            email: 'ana@uco.edu.co',
          },
          estado: {
            id: 'st-1',
            nombre: 'Disponible para evaluación',
            fechaActualizacion: '2026-09-01T10:00:00',
          },
        },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
      empty: false,
    };

    it('hace POST /fichas-perfil/coordinador sin filtros y traduce la respuesta conservando la paginación', async () => {
      // Arrange
      post.mockResolvedValue({ status: 200, data: paginaDto });

      // Act
      const resultado = await fichasPerfilService.getFichasRepresentante(0, 10, vacios);

      // Assert
      expect(post).toHaveBeenCalledWith('/fichas-perfil/coordinador', { pagina: 0, tamanio: 10 });
      expect(resultado).toEqual({
        ...paginaDto,
        content: [
          {
            id: 'f-1',
            titulo: 'Sistema de monitoreo',
            asesorNombre: 'Ana Ruiz',
            asesorEmail: 'ana@uco.edu.co',
            estadoId: 'st-1',
            estadoActual: 'Disponible para evaluación',
            estadoFechaActualizacion: '2026-09-01T10:00:00',
          },
        ],
      });
    });

    it('envía el ordenamiento solo cuando llega', async () => {
      // Arrange
      post.mockResolvedValue({ status: 200, data: paginaDto });

      // Act
      await fichasPerfilService.getFichasRepresentante(0, 10, vacios, ['asesorNombre:DESC']);

      // Assert
      expect(post).toHaveBeenCalledWith('/fichas-perfil/coordinador', {
        pagina: 0,
        tamanio: 10,
        ordenamiento: ['asesorNombre:DESC'],
      });
    });

    it('envía un solo filtro sin GRUPO y combina varios en un GRUPO AND con IN para los estados', async () => {
      // Arrange
      post.mockResolvedValue({ status: 200, data: paginaDto });

      // Act
      await fichasPerfilService.getFichasRepresentante(1, 10, { ...vacios, titulo: ' monitoreo ' });
      await fichasPerfilService.getFichasRepresentante(0, 10, {
        titulo: 'monitoreo',
        asesorNombre: '',
        asesorEmail: 'ana@',
        estadoIds: ['st-1', 'st-2'],
      });

      // Assert
      expect(post).toHaveBeenNthCalledWith(1, '/fichas-perfil/coordinador', {
        pagina: 1,
        tamanio: 10,
        filtros: {
          tipo: 'PREDICADO',
          campo: 'tituloProyecto',
          operador: 'CONTIENE',
          valor: 'monitoreo',
        },
      });
      expect(post).toHaveBeenNthCalledWith(2, '/fichas-perfil/coordinador', {
        pagina: 0,
        tamanio: 10,
        filtros: {
          tipo: 'GRUPO',
          conector: 'AND',
          nodos: [
            {
              tipo: 'PREDICADO',
              campo: 'tituloProyecto',
              operador: 'CONTIENE',
              valor: 'monitoreo',
            },
            { tipo: 'PREDICADO', campo: 'asesorEmail', operador: 'CONTIENE', valor: 'ana@' },
            {
              tipo: 'PREDICADO_MULTIVALOR',
              campo: 'estadoFicha',
              operador: 'IN',
              valores: ['st-1', 'st-2'],
            },
          ],
        },
      });
    });
  });

  describe('getItemsFichaRepresentante', () => {
    it('consulta GET /fichas-perfil/{id}/items/representante y traduce el DTO plano al modelo anidado', async () => {
      // Arrange
      get.mockResolvedValue({
        status: 200,
        data: [
          {
            id: 'i-1',
            fichaPerfilId: 'f-1',
            tipoItem: 't-1',
            tipoItemNombre: 'Objetivo',
            contenido: 'Medir',
          },
        ],
      });

      // Act
      const resultado = await fichasPerfilService.getItemsFichaRepresentante('f-1');

      // Assert
      expect(get).toHaveBeenCalledWith('/fichas-perfil/f-1/items/representante');
      expect(resultado).toEqual([
        {
          id: 'i-1',
          fichaPerfilId: 'f-1',
          tipoItem: { id: 't-1', nombre: 'Objetivo' },
          contenido: 'Medir',
        },
      ]);
    });

    it('devuelve una lista vacía tal cual cuando la ficha no tiene ítems', async () => {
      // Arrange
      get.mockResolvedValue({ status: 200, data: [] });

      // Act
      const resultado = await fichasPerfilService.getItemsFichaRepresentante('f-1');

      // Assert
      expect(resultado).toEqual([]);
    });
  });

  describe('getEvaluacionFicha', () => {
    it('consulta GET /fichas-perfil/{id}/evaluaciones/representante, traduce estadoEvaluacion a estadoEvaluacionId y conserva los null', async () => {
      // Arrange
      get.mockResolvedValue({
        status: 200,
        data: [
          {
            id: 'ev-1',
            fichaPerfilId: 'f-1',
            fechaCreacion: '2026-10-01',
            estadoEvaluacion: 'st-1',
            estadoEvaluacionNombre: 'Aprobada',
          },
          {
            id: 'ev-2',
            fichaPerfilId: 'f-1',
            fechaCreacion: '2026-10-02',
            estadoEvaluacion: null,
            estadoEvaluacionNombre: null,
          },
        ],
      });

      // Act
      const resultado = await fichasPerfilService.getEvaluacionFicha('f-1');

      // Assert
      expect(get).toHaveBeenCalledWith('/fichas-perfil/f-1/evaluaciones/representante');
      expect(resultado).toEqual([
        {
          id: 'ev-1',
          fichaPerfilId: 'f-1',
          fechaCreacion: '2026-10-01',
          estadoEvaluacionId: 'st-1',
          estadoEvaluacionNombre: 'Aprobada',
        },
        {
          id: 'ev-2',
          fichaPerfilId: 'f-1',
          fechaCreacion: '2026-10-02',
          estadoEvaluacionId: null,
          estadoEvaluacionNombre: null,
        },
      ]);
    });

    it('devuelve una lista vacía tal cual cuando no hay evaluaciones', async () => {
      // Arrange
      get.mockResolvedValue({ status: 200, data: [] });

      // Act
      const resultado = await fichasPerfilService.getEvaluacionFicha('f-1');

      // Assert
      expect(resultado).toEqual([]);
    });
  });

  describe('getEstadosEvaluacion', () => {
    it('consulta GET /fichas-perfil/estados-evaluacion y resuelve el data sin transformar', async () => {
      // Arrange
      const estados = [{ id: 'ev-1', nombre: 'En Evaluación', descripcion: 'Evaluación en curso' }];
      get.mockResolvedValue({ status: 200, data: estados });

      // Act
      const resultado = await fichasPerfilService.getEstadosEvaluacion();

      // Assert
      expect(get).toHaveBeenCalledWith('/fichas-perfil/estados-evaluacion');
      expect(resultado).toEqual(estados);
    });
  });
});
