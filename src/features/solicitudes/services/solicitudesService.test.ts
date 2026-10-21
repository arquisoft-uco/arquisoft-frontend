import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../../api/axiosInstance';
import type { ConsultaCriteriaRequest } from '../../../shared/models/query-criteria';
import { solicitudesService } from './solicitudesService';

vi.mock('../../../api/axiosInstance', () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn(), patch: vi.fn() },
}));

const get = vi.mocked(apiClient.get);
const post = vi.mocked(apiClient.post);
const eliminar = vi.mocked(apiClient.delete);
const patch = vi.mocked(apiClient.patch);

const CRITERIO: ConsultaCriteriaRequest = {
  pagina: 1,
  tamanio: 10,
  ordenamiento: ['fechaRespuesta:DESC'],
  filtros: {
    tipo: 'PREDICADO_MULTIVALOR',
    campo: 'estadoRespuestaId',
    operador: 'IN',
    valores: ['APROBADA'],
  },
};

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

  describe('consultarSolicitudesNovedadCoordinadorRecibidas', () => {
    const pagina = {
      content: [],
      page: 1,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      first: false,
      last: true,
      empty: true,
    };

    it('llama POST /solicitudes/novedad-coordinador/recibidas con { pagina, tamanio } y resuelve la página', async () => {
      // Arrange
      post.mockResolvedValue({ status: 200, data: pagina });

      // Act
      const resultado = await solicitudesService.consultarSolicitudesNovedadCoordinadorRecibidas(
        1,
        10,
      );

      // Assert
      expect(post).toHaveBeenCalledWith('/solicitudes/novedad-coordinador/recibidas', {
        pagina: 1,
        tamanio: 10,
      });
      expect(resultado).toEqual(pagina);
    });
  });

  describe('consultarRespuestasNovedadCoordinadorEnviadas', () => {
    it('llama POST /solicitudes/novedad-coordinador/respuestas/enviadas con el criterio recibido tal cual y resuelve la página', async () => {
      // Arrange
      const pagina = {
        content: [],
        page: 1,
        size: 10,
        totalElements: 0,
        totalPages: 0,
        first: false,
        last: true,
        empty: true,
      };
      post.mockResolvedValue({ status: 200, data: pagina });

      // Act
      const resultado =
        await solicitudesService.consultarRespuestasNovedadCoordinadorEnviadas(CRITERIO);

      // Assert
      expect(post).toHaveBeenCalledWith(
        '/solicitudes/novedad-coordinador/respuestas/enviadas',
        CRITERIO,
      );
      expect(resultado).toEqual(pagina);
    });
  });

  describe('consultarRespuestasNovedadCoordinadorRecibidas', () => {
    it('llama POST /solicitudes/novedad-coordinador/respuestas/recibidas con el criterio recibido tal cual y resuelve la página', async () => {
      // Arrange
      const pagina = {
        content: [],
        page: 1,
        size: 10,
        totalElements: 0,
        totalPages: 0,
        first: false,
        last: true,
        empty: true,
      };
      post.mockResolvedValue({ status: 200, data: pagina });

      // Act
      const resultado =
        await solicitudesService.consultarRespuestasNovedadCoordinadorRecibidas(CRITERIO);

      // Assert
      expect(post).toHaveBeenCalledWith(
        '/solicitudes/novedad-coordinador/respuestas/recibidas',
        CRITERIO,
      );
      expect(resultado).toEqual(pagina);
    });
  });

  describe('getEstadosRespuesta', () => {
    it('llama GET /solicitudes/estados-respuesta y resuelve la lista', async () => {
      // Arrange
      const estados = [{ id: 'APROBADA', nombre: 'Aprobada', descripcion: 'Aceptada' }];
      get.mockResolvedValue({ status: 200, data: estados });

      // Act
      const resultado = await solicitudesService.getEstadosRespuesta();

      // Assert
      expect(get).toHaveBeenCalledWith('/solicitudes/estados-respuesta');
      expect(resultado).toEqual(estados);
    });
  });

  describe('eliminarSolicitudNovedadCoordinador', () => {
    it('llama DELETE /solicitudes/novedad-coordinador/{id} sin body y resuelve undefined', async () => {
      // Arrange
      eliminar.mockResolvedValue({ status: 204, data: '' });

      // Act
      const resultado = await solicitudesService.eliminarSolicitudNovedadCoordinador('s-1');

      // Assert
      expect(eliminar).toHaveBeenCalledWith('/solicitudes/novedad-coordinador/s-1');
      expect(resultado).toBeUndefined();
    });
  });

  describe('eliminarSolicitudNovedadAsesor', () => {
    it('llama DELETE /solicitudes/novedad-asesor/{id} sin body y resuelve undefined', async () => {
      // Arrange
      eliminar.mockResolvedValue({ status: 204, data: '' });

      // Act
      const resultado = await solicitudesService.eliminarSolicitudNovedadAsesor('s-1');

      // Assert
      expect(eliminar).toHaveBeenCalledWith('/solicitudes/novedad-asesor/s-1');
      expect(resultado).toBeUndefined();
    });
  });

  describe('eliminarRespuestaNovedadCoordinador', () => {
    it('llama DELETE /solicitudes/novedad-coordinador/{solicitudId}/respuesta sin body y resuelve undefined', async () => {
      // Arrange
      eliminar.mockResolvedValue({ status: 204, data: '' });

      // Act
      const resultado = await solicitudesService.eliminarRespuestaNovedadCoordinador('s-1');

      // Assert
      expect(eliminar).toHaveBeenCalledWith('/solicitudes/novedad-coordinador/s-1/respuesta');
      expect(resultado).toBeUndefined();
    });
  });

  describe('responderSolicitudNovedadCoordinador', () => {
    it('llama POST /solicitudes/novedad-coordinador/{solicitudId}/respuesta con solo { contenido } y resuelve { id }', async () => {
      // Arrange
      post.mockResolvedValue({ status: 201, data: { id: 'r-1' } });

      // Act
      const resultado = await solicitudesService.responderSolicitudNovedadCoordinador({
        solicitudId: 's-1',
        contenido: 'Programemos una reunión.',
      });

      // Assert
      expect(post).toHaveBeenCalledWith('/solicitudes/novedad-coordinador/s-1/respuesta', {
        contenido: 'Programemos una reunión.',
      });
      expect(resultado).toEqual({ id: 'r-1' });
    });
  });

  describe('responderSolicitudNovedadAsesor', () => {
    it('llama POST /solicitudes/novedad-asesor/{solicitudId}/respuesta con solo { contenido } y resuelve { id }', async () => {
      // Arrange
      post.mockResolvedValue({ status: 201, data: { id: 'r-2' } });

      // Act
      const resultado = await solicitudesService.responderSolicitudNovedadAsesor({
        solicitudId: 's-2',
        contenido: 'Revisemos tu avance el lunes.',
      });

      // Assert
      expect(post).toHaveBeenCalledWith('/solicitudes/novedad-asesor/s-2/respuesta', {
        contenido: 'Revisemos tu avance el lunes.',
      });
      expect(resultado).toEqual({ id: 'r-2' });
    });
  });

  describe('modificarEstadoRespuestaNovedadCoordinador', () => {
    it('llama PATCH /solicitudes/novedad-coordinador/{solicitudId}/respuesta/estado con solo { nuevoEstado } y resuelve undefined', async () => {
      // Arrange
      patch.mockResolvedValue({ status: 204, data: '' });

      // Act
      const resultado = await solicitudesService.modificarEstadoRespuestaNovedadCoordinador({
        solicitudId: 'abc',
        nuevoEstado: 'APROBADA',
      });

      // Assert
      expect(patch).toHaveBeenCalledWith('/solicitudes/novedad-coordinador/abc/respuesta/estado', {
        nuevoEstado: 'APROBADA',
      });
      expect(resultado).toBeUndefined();
    });
  });
});
