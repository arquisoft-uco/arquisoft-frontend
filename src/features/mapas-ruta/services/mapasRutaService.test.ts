import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../../api/axiosInstance';
import { mapasRutaService } from './mapasRutaService';

vi.mock('../../../api/axiosInstance', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const get = vi.mocked(apiClient.get);
const post = vi.mocked(apiClient.post);
const patch = vi.mocked(apiClient.patch);
const eliminar = vi.mocked(apiClient.delete);

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

    it('devuelve una lista vacía cuando el catálogo no tiene filas', async () => {
      // Arrange
      get.mockResolvedValue({ data: [] });

      // Act
      const resultado = await mapasRutaService.consultarEstadosTarea();

      // Assert
      expect(resultado).toEqual([]);
    });
  });

  describe('cambiarEstadoTarea', () => {
    it('traduce estadoItemId a estadoItem en PATCH /tareas/{id}/estado-item y resuelve undefined', async () => {
      // Arrange
      patch.mockResolvedValue({ status: 204, data: '' });

      // Act
      const resultado = await mapasRutaService.cambiarEstadoTarea('t-1', {
        estadoItemId: 'EN_PROGRESO',
      });

      // Assert
      expect(patch).toHaveBeenCalledWith('/tareas/t-1/estado-item', { estadoItem: 'EN_PROGRESO' });
      expect(resultado).toBeUndefined();
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

  describe('asignarTarea', () => {
    it('traduce asesorId a asesor en POST /mapas-ruta/{id}/tareas y devuelve el id', async () => {
      // Arrange
      post.mockResolvedValue({ status: 201, data: { id: 't-9' } });

      // Act
      const resultado = await mapasRutaService.asignarTarea('m-1', {
        descripcion: 'Redactar capítulo',
        asesorId: 'a-2',
      });

      // Assert
      expect(post).toHaveBeenCalledWith('/mapas-ruta/m-1/tareas', {
        descripcion: 'Redactar capítulo',
        asesor: 'a-2',
      });
      expect(resultado).toEqual({ id: 't-9' });
    });
  });

  describe('modificarInformacionTarea', () => {
    it('traduce asesorId a asesor en PATCH /tareas/{id} y resuelve undefined', async () => {
      // Arrange
      patch.mockResolvedValue({ status: 204, data: '' });

      // Act
      const resultado = await mapasRutaService.modificarInformacionTarea('t-1', {
        descripcion: 'Nueva descripción',
        asesorId: 'a-2',
      });

      // Assert
      expect(patch).toHaveBeenCalledWith('/tareas/t-1', {
        descripcion: 'Nueva descripción',
        asesor: 'a-2',
      });
      expect(resultado).toBeUndefined();
    });
  });

  describe('eliminarTarea', () => {
    it('hace DELETE /tareas/{id} sin body y resuelve undefined', async () => {
      // Arrange
      eliminar.mockResolvedValue({ status: 204, data: '' });

      // Act
      const resultado = await mapasRutaService.eliminarTarea('t-1');

      // Assert
      expect(eliminar).toHaveBeenCalledWith('/tareas/t-1');
      expect(resultado).toBeUndefined();
    });
  });

  describe('consultarAsesoresProyecto', () => {
    it('hace GET de los asesores asignados y traduce asesorId a id y estadoAsesor a estadoId', async () => {
      // Arrange
      get.mockResolvedValue({
        status: 200,
        data: [
          {
            asesorId: 'a-1',
            nombre: 'Ana Ruiz',
            email: 'ana@uco.edu.co',
            estadoAsesor: 'ASIGNADO',
            actual: true,
          },
        ],
      });

      // Act
      const resultado = await mapasRutaService.consultarAsesoresProyecto('p-1');

      // Assert
      expect(get).toHaveBeenCalledWith('/proyectos-grado/p-1/asesores-asignados');
      expect(resultado).toEqual([
        {
          id: 'a-1',
          nombre: 'Ana Ruiz',
          email: 'ana@uco.edu.co',
          estadoId: 'ASIGNADO',
          actual: true,
        },
      ]);
    });
  });
  describe('agregarPlanEstimado', () => {
    it('hace POST /tareas/{id}/planes-estimados con el tareaId solo en el path', async () => {
      // Arrange
      post.mockResolvedValue({ status: 201, data: { id: 'p-1' } });

      // Act
      const resultado = await mapasRutaService.agregarPlanEstimado('t-1', {
        tiempoEstimadoDias: 5,
        descripcionEstimado: 'Redacción',
      });

      // Assert
      expect(post).toHaveBeenCalledWith('/tareas/t-1/planes-estimados', {
        tiempoEstimadoDias: 5,
        descripcionEstimado: 'Redacción',
      });
      expect(resultado).toEqual({ id: 'p-1' });
    });
  });

  describe('modificarPlanEstimado', () => {
    it('hace PATCH /planes-estimados/{id} con solo la descripcion, tambien vacia, y resuelve undefined', async () => {
      // Arrange
      patch.mockResolvedValue({ status: 204, data: '' });

      // Act
      const resultado = await mapasRutaService.modificarPlanEstimado('p-1', {
        descripcionEstimado: '',
      });

      // Assert
      expect(patch).toHaveBeenCalledWith('/planes-estimados/p-1', { descripcionEstimado: '' });
      expect(resultado).toBeUndefined();
    });
  });

  describe('modificarPlanReal', () => {
    it('hace PATCH /mapas-ruta/planes-reales/{id} con días y descripción y resuelve undefined', async () => {
      // Arrange
      patch.mockResolvedValue({ status: 204, data: '' });

      // Act
      const resultado = await mapasRutaService.modificarPlanReal('r-1', {
        tiempoRealDias: 4,
        descripcionReal: '',
      });

      // Assert
      expect(patch).toHaveBeenCalledWith('/mapas-ruta/planes-reales/r-1', {
        tiempoRealDias: 4,
        descripcionReal: '',
      });
      expect(resultado).toBeUndefined();
    });
  });

  describe('eliminarPlanEstimado', () => {
    it('hace DELETE /mapas-ruta/planes-estimados/{id} y resuelve undefined', async () => {
      // Arrange
      eliminar.mockResolvedValue({ status: 204, data: '' });

      // Act
      const resultado = await mapasRutaService.eliminarPlanEstimado('p-1');

      // Assert
      expect(eliminar).toHaveBeenCalledWith('/mapas-ruta/planes-estimados/p-1');
      expect(resultado).toBeUndefined();
    });
  });

  describe('eliminarPlanReal', () => {
    it('hace DELETE /mapas-ruta/planes-reales/{id} y resuelve undefined', async () => {
      // Arrange
      eliminar.mockResolvedValue({ status: 204, data: '' });

      // Act
      const resultado = await mapasRutaService.eliminarPlanReal('r-1');

      // Assert
      expect(eliminar).toHaveBeenCalledWith('/mapas-ruta/planes-reales/r-1');
      expect(resultado).toBeUndefined();
    });
  });

  describe('consultarPlanesEstimadosTarea', () => {
    it('hace POST con el body recibido y traduce tarea a tareaId conservando la página', async () => {
      // Arrange
      post.mockResolvedValue({
        data: {
          content: [{ id: 'p-1', tarea: 't-1', tiempoEstimadoDias: 5, descripcionEstimado: null }],
          totalElements: 1,
          totalPages: 1,
        },
      });
      const req = { pagina: 0, tamanio: 10 };

      // Act
      const pagina = await mapasRutaService.consultarPlanesEstimadosTarea('t-1', req);

      // Assert
      expect(post).toHaveBeenCalledWith('/tareas/t-1/planes-estimados/estudiante', req);
      expect(pagina.totalElements).toBe(1);
      expect(pagina.content).toEqual([
        { id: 'p-1', tareaId: 't-1', tiempoEstimadoDias: 5, descripcionEstimado: null },
      ]);
    });
  });

  describe('consultarPlanesRealesTarea', () => {
    it('hace POST con el body recibido y traduce tarea a tareaId conservando null y la página', async () => {
      // Arrange
      post.mockResolvedValue({
        data: {
          content: [{ id: 'r-1', tarea: 't-1', tiempoRealDias: 3, descripcionReal: null }],
          totalElements: 1,
          totalPages: 1,
        },
      });
      const req = { pagina: 0, tamanio: 10 };

      // Act
      const pagina = await mapasRutaService.consultarPlanesRealesTarea('t-1', req);

      // Assert
      expect(post).toHaveBeenCalledWith('/mapas-ruta/tareas/t-1/planes-reales/estudiante', req);
      expect(pagina.totalElements).toBe(1);
      expect(pagina.content).toEqual([
        { id: 'r-1', tareaId: 't-1', tiempoRealDias: 3, descripcionReal: null },
      ]);
    });
  });
});
