import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../../api/axiosInstance';
import { mapasRutaService } from './mapasRutaService';

vi.mock('../../../api/axiosInstance', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));

const get = vi.mocked(apiClient.get);
const post = vi.mocked(apiClient.post);
const patch = vi.mocked(apiClient.patch);

describe('mapasRutaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('agregarMapaRuta', () => {
    it('traduce proyectoGradoId a proyectoGrado en POST /mapas-ruta y resuelve { id }', async () => {
      // Arrange
      post.mockResolvedValue({ status: 201, data: { id: 'm-1' } });

      // Act
      const resultado = await mapasRutaService.agregarMapaRuta({
        proyectoGradoId: 'p-1',
        fechaInicio: '2026-10-22',
        fechaFin: '2026-12-01',
      });

      // Assert
      expect(post).toHaveBeenCalledWith('/mapas-ruta', {
        proyectoGrado: 'p-1',
        fechaInicio: '2026-10-22',
        fechaFin: '2026-12-01',
      });
      expect(resultado).toEqual({ id: 'm-1' });
    });
  });

  describe('consultarProyectosElegibles', () => {
    it('filtra EN_PROCESO, ordena por título, pide 20 por página y traduce la respuesta', async () => {
      // Arrange
      post.mockResolvedValue({
        data: {
          content: [{ id: 'p-1', tituloProyecto: 'Sistema A', otro: 'x' }],
          page: 2,
          last: false,
        },
      });

      // Act
      const resultado = await mapasRutaService.consultarProyectosElegibles(2);

      // Assert
      expect(post).toHaveBeenCalledWith('/proyectos-grado/coordinador', {
        pagina: 2,
        tamanio: 20,
        ordenamiento: ['tituloProyecto:ASC'],
        filtros: {
          tipo: 'PREDICADO_MULTIVALOR',
          campo: 'estadoProyectoGrado',
          operador: 'IN',
          valores: ['EN_PROCESO'],
        },
      });
      expect(resultado).toEqual({
        proyectos: [{ id: 'p-1', titulo: 'Sistema A' }],
        siguientePagina: 3,
      });
    });

    it('devuelve siguientePagina null en la última página', async () => {
      // Arrange
      post.mockResolvedValue({ data: { content: [], page: 4, last: true } });

      // Act
      const resultado = await mapasRutaService.consultarProyectosElegibles(4);

      // Assert
      expect(resultado.siguientePagina).toBeNull();
    });
  });

  describe('consultarMapasRutaCoordinador', () => {
    it('envía el criterio a POST /mapas-ruta/coordinador y traduce los campos del mapa', async () => {
      // Arrange
      post.mockResolvedValue({
        data: {
          content: [
            {
              id: 'm-1',
              proyectoGrado: 'p-1',
              tituloProyecto: 'Sistema A',
              fechaInicio: '2026-03-05',
              fechaFin: '2026-08-01',
            },
          ],
          page: 0,
          totalElements: 1,
          last: true,
        },
      });
      const criterio = { pagina: 0, tamanio: 10, ordenamiento: ['fechaFin:ASC'] };

      // Act
      const resultado = await mapasRutaService.consultarMapasRutaCoordinador(criterio);

      // Assert
      expect(post).toHaveBeenCalledWith('/mapas-ruta/coordinador', criterio);
      expect(resultado).toEqual({
        content: [
          {
            id: 'm-1',
            proyectoGradoId: 'p-1',
            titulo: 'Sistema A',
            fechaInicio: '2026-03-05',
            fechaFin: '2026-08-01',
          },
        ],
        page: 0,
        totalElements: 1,
        last: true,
      });
    });
  });

  describe('consultarMapaRutaEstudiante', () => {
    it('hace GET /mapas-ruta/estudiante sin parámetros y traduce los campos del mapa', async () => {
      // Arrange
      get.mockResolvedValue({
        data: {
          id: 'm-1',
          proyectoGrado: 'p-1',
          tituloProyecto: 'Sistema A',
          fechaInicio: '2026-03-05',
          fechaFin: '2026-08-01',
        },
      });

      // Act
      const resultado = await mapasRutaService.consultarMapaRutaEstudiante();

      // Assert
      expect(get).toHaveBeenCalledWith('/mapas-ruta/estudiante');
      expect(resultado).toEqual({
        id: 'm-1',
        proyectoGradoId: 'p-1',
        titulo: 'Sistema A',
        fechaInicio: '2026-03-05',
        fechaFin: '2026-08-01',
      });
    });
  });

  describe('consultarTareasMapaRuta', () => {
    it('hace POST a la ruta del mapa y traduce el DTO plano a Tarea anidada conservando la página', async () => {
      // Arrange
      post.mockResolvedValue({
        data: {
          content: [
            {
              id: 't-1',
              descripcion: 'Entregar informe',
              mapaRuta: 'm-1',
              fechaInicioMapaRuta: '2026-03-05',
              fechaFinMapaRuta: '2026-08-01',
              estadoItem: 'NUEVA',
              nombreEstadoItem: 'Nueva',
              asesor: 'a-1',
              nombreAsesor: 'Ana Ruiz',
              emailAsesor: 'ana@uco.edu.co',
            },
          ],
          totalElements: 1,
          totalPages: 1,
        },
      });
      const req = { pagina: 0, tamanio: 10, ordenamiento: ['descripcion:ASC'] };

      // Act
      const pagina = await mapasRutaService.consultarTareasMapaRuta('m-1', req);

      // Assert
      expect(post).toHaveBeenCalledWith('/mapas-ruta/m-1/tareas/estudiante', req);
      expect(pagina.totalElements).toBe(1);
      expect(pagina.content).toEqual([
        {
          id: 't-1',
          descripcion: 'Entregar informe',
          mapaRutaId: 'm-1',
          fechaInicioMapaRuta: '2026-03-05',
          fechaFinMapaRuta: '2026-08-01',
          estado: { id: 'NUEVA', nombre: 'Nueva' },
          asesor: { id: 'a-1', nombre: 'Ana Ruiz', email: 'ana@uco.edu.co' },
        },
      ]);
    });
  });

  describe('consultarTarea', () => {
    it('hace GET a /tareas/{id} y traduce el DTO plano a Tarea anidada con las fechas', async () => {
      // Arrange
      get.mockResolvedValue({
        data: {
          id: 't-1',
          descripcion: 'Entregar informe',
          mapaRuta: 'm-1',
          fechaInicioMapaRuta: '2026-03-05',
          fechaFinMapaRuta: '2026-08-01',
          estadoItem: 'NUEVA',
          nombreEstadoItem: 'Nueva',
          asesor: 'a-1',
          nombreAsesor: 'Ana Ruiz',
          emailAsesor: 'ana@uco.edu.co',
        },
      });

      // Act
      const tarea = await mapasRutaService.consultarTarea('t-1');

      // Assert
      expect(get).toHaveBeenCalledWith('/tareas/t-1');
      expect(tarea).toEqual({
        id: 't-1',
        descripcion: 'Entregar informe',
        mapaRutaId: 'm-1',
        fechaInicioMapaRuta: '2026-03-05',
        fechaFinMapaRuta: '2026-08-01',
        estado: { id: 'NUEVA', nombre: 'Nueva' },
        asesor: { id: 'a-1', nombre: 'Ana Ruiz', email: 'ana@uco.edu.co' },
      });
    });
  });

  describe('consultarEstadosTarea', () => {
    it('hace GET a /estados-item y devuelve el catálogo', async () => {
      // Arrange
      const catalogo = [{ id: 'NUEVA', nombre: 'Nueva', descripcion: 'd' }];
      get.mockResolvedValue({ data: catalogo });

      // Act
      const resultado = await mapasRutaService.consultarEstadosTarea();

      // Assert
      expect(get).toHaveBeenCalledWith('/estados-item');
      expect(resultado).toEqual(catalogo);
    });
  });

  describe('cambiarFechaFin', () => {
    it('hace PATCH /mapas-ruta/{id}/fecha-fin solo con fechaFin y resuelve undefined', async () => {
      // Arrange
      patch.mockResolvedValue({ status: 204, data: '' });

      // Act
      const resultado = await mapasRutaService.cambiarFechaFin('m-1', { fechaFin: '2026-12-01' });

      // Assert
      expect(patch).toHaveBeenCalledWith('/mapas-ruta/m-1/fecha-fin', { fechaFin: '2026-12-01' });
      expect(resultado).toBeUndefined();
    });
  });
});
