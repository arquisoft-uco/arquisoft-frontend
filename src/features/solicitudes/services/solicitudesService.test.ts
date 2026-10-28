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

  describe('enviarSolicitudCambioAsesor', () => {
    it('llama POST /solicitudes/cambio-asesor con { destinatario, mensajeSolicitud } y resuelve { id }', async () => {
      // Arrange
      post.mockResolvedValue({ status: 201, data: { id: 's-3' } });

      // Act
      const resultado = await solicitudesService.enviarSolicitudCambioAsesor({
        destinatario: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
        mensajeSolicitud: 'Necesito cambiar de asesor.',
      });

      // Assert
      expect(post).toHaveBeenCalledWith('/solicitudes/cambio-asesor', {
        destinatario: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
        mensajeSolicitud: 'Necesito cambiar de asesor.',
      });
      expect(resultado).toEqual({ id: 's-3' });
    });
  });

  describe('enviarSolicitudAmpliacionPlazo', () => {
    it('llama POST /solicitudes/ampliacion-plazo con { destinatario, mensajeSolicitud } y resuelve { id }', async () => {
      // Arrange
      post.mockResolvedValue({ status: 201, data: { id: 's-4' } });

      // Act
      const resultado = await solicitudesService.enviarSolicitudAmpliacionPlazo({
        destinatario: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
        mensajeSolicitud: 'Necesito más plazo.',
      });

      // Assert
      expect(post).toHaveBeenCalledWith('/solicitudes/ampliacion-plazo', {
        destinatario: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
        mensajeSolicitud: 'Necesito más plazo.',
      });
      expect(resultado).toEqual({ id: 's-4' });
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

  describe('consultarSolicitudesAmpliacionPlazoEnviadas', () => {
    const pagina = {
      content: [],
      page: 2,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      first: false,
      last: true,
      empty: true,
    };

    it('llama POST /solicitudes/ampliacion-plazo/enviadas con { pagina, tamanio } y resuelve la página', async () => {
      // Arrange
      post.mockResolvedValue({ status: 200, data: pagina });

      // Act
      const resultado = await solicitudesService.consultarSolicitudesAmpliacionPlazoEnviadas(2, 10);

      // Assert
      expect(post).toHaveBeenCalledWith('/solicitudes/ampliacion-plazo/enviadas', {
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

  describe('consultarRespuestasNovedadAsesorRecibidas', () => {
    it('llama POST /solicitudes/novedad-asesor/respuestas/recibidas con el criterio recibido tal cual y resuelve la página', async () => {
      // Arrange
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
      post.mockResolvedValue({ status: 200, data: pagina });

      // Act
      const resultado =
        await solicitudesService.consultarRespuestasNovedadAsesorRecibidas(CRITERIO);

      // Assert
      expect(post).toHaveBeenCalledWith(
        '/solicitudes/novedad-asesor/respuestas/recibidas',
        CRITERIO,
      );
      expect(resultado).toEqual(pagina);
    });
  });

  describe('consultarRespuestasCambioAsesorRecibidas', () => {
    it('llama POST /solicitudes/cambio-asesor/respuestas/recibidas con el criterio recibido tal cual y resuelve la página', async () => {
      // Arrange
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
      post.mockResolvedValue({ status: 200, data: pagina });

      // Act
      const resultado = await solicitudesService.consultarRespuestasCambioAsesorRecibidas(CRITERIO);

      // Assert
      expect(post).toHaveBeenCalledWith(
        '/solicitudes/cambio-asesor/respuestas/recibidas',
        CRITERIO,
      );
      expect(resultado).toEqual(pagina);
    });
  });

  describe('consultarRespuestasAmpliacionPlazoRecibidas', () => {
    it('llama POST /solicitudes/ampliacion-plazo/respuestas/recibidas con el criterio recibido tal cual y resuelve la página', async () => {
      // Arrange
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
      post.mockResolvedValue({ status: 200, data: pagina });

      // Act
      const resultado =
        await solicitudesService.consultarRespuestasAmpliacionPlazoRecibidas(CRITERIO);

      // Assert
      expect(post).toHaveBeenCalledWith(
        '/solicitudes/ampliacion-plazo/respuestas/recibidas',
        CRITERIO,
      );
      expect(resultado).toEqual(pagina);
    });
  });

  describe('consultarRespuestasNovedadAsesorEnviadas', () => {
    it('llama POST /solicitudes/novedad-asesor/respuestas/enviadas con el criterio recibido tal cual y resuelve la página', async () => {
      // Arrange
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
      post.mockResolvedValueOnce({ data: pagina });

      // Act
      const resultado = await solicitudesService.consultarRespuestasNovedadAsesorEnviadas(CRITERIO);

      // Assert
      expect(post).toHaveBeenCalledWith(
        '/solicitudes/novedad-asesor/respuestas/enviadas',
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

  describe('eliminarSolicitudCambioAsesor', () => {
    it('llama DELETE /solicitudes/cambio-asesor/{id} sin body y resuelve undefined', async () => {
      // Arrange
      eliminar.mockResolvedValue({ status: 204, data: '' });

      // Act
      const resultado = await solicitudesService.eliminarSolicitudCambioAsesor('s-1');

      // Assert
      expect(eliminar).toHaveBeenCalledWith('/solicitudes/cambio-asesor/s-1');
      expect(resultado).toBeUndefined();
    });
  });

  describe('eliminarSolicitudAmpliacionPlazo', () => {
    it('llama DELETE /solicitudes/ampliacion-plazo/{id} sin body y resuelve undefined', async () => {
      // Arrange
      eliminar.mockResolvedValue({ status: 204, data: '' });

      // Act
      const resultado = await solicitudesService.eliminarSolicitudAmpliacionPlazo('s-1');

      // Assert
      expect(eliminar).toHaveBeenCalledWith('/solicitudes/ampliacion-plazo/s-1');
      expect(resultado).toBeUndefined();
    });
  });

  describe('eliminarRespuestaCambioAsesor', () => {
    it('llama DELETE /solicitudes/cambio-asesor/{solicitudId}/respuesta sin body y resuelve undefined', async () => {
      // Arrange
      eliminar.mockResolvedValue({ status: 204, data: '' });

      // Act
      const resultado = await solicitudesService.eliminarRespuestaCambioAsesor('s-1');

      // Assert
      expect(eliminar).toHaveBeenCalledWith('/solicitudes/cambio-asesor/s-1/respuesta');
      expect(resultado).toBeUndefined();
    });
  });

  describe('eliminarRespuestaAmpliacionPlazo', () => {
    it('llama DELETE /solicitudes/ampliacion-plazo/{solicitudId}/respuesta sin body y resuelve undefined', async () => {
      // Arrange
      eliminar.mockResolvedValue({ status: 204, data: '' });

      // Act
      const resultado = await solicitudesService.eliminarRespuestaAmpliacionPlazo('s-1');

      // Assert
      expect(eliminar).toHaveBeenCalledWith('/solicitudes/ampliacion-plazo/s-1/respuesta');
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

  describe('eliminarRespuestaNovedadAsesor', () => {
    it('llama DELETE /solicitudes/novedad-asesor/{solicitudId}/respuesta sin body y resuelve undefined', async () => {
      // Arrange
      eliminar.mockResolvedValue({ status: 204, data: '' });

      // Act
      const resultado = await solicitudesService.eliminarRespuestaNovedadAsesor('s-1');

      // Assert
      expect(eliminar).toHaveBeenCalledWith('/solicitudes/novedad-asesor/s-1/respuesta');
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

  describe('responderSolicitudAmpliacionPlazo', () => {
    it('llama POST /solicitudes/ampliacion-plazo/{solicitudId}/respuesta con solo { contenido } y resuelve { id }', async () => {
      // Arrange
      post.mockResolvedValue({ status: 201, data: { id: 'r-4' } });

      // Act
      const resultado = await solicitudesService.responderSolicitudAmpliacionPlazo({
        solicitudId: 's-4',
        contenido: 'Plazo ampliado.',
      });

      // Assert
      expect(post).toHaveBeenCalledWith('/solicitudes/ampliacion-plazo/s-4/respuesta', {
        contenido: 'Plazo ampliado.',
      });
      expect(resultado).toEqual({ id: 'r-4' });
    });
  });

  describe('responderSolicitudCambioAsesor', () => {
    it('llama POST /solicitudes/cambio-asesor/{solicitudId}/respuesta con solo { contenido } y resuelve { id }', async () => {
      // Arrange
      post.mockResolvedValue({ status: 201, data: { id: 'r-3' } });

      // Act
      const resultado = await solicitudesService.responderSolicitudCambioAsesor({
        solicitudId: 's-3',
        contenido: 'Revisemos el cambio.',
      });

      // Assert
      expect(post).toHaveBeenCalledWith('/solicitudes/cambio-asesor/s-3/respuesta', {
        contenido: 'Revisemos el cambio.',
      });
      expect(resultado).toEqual({ id: 'r-3' });
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

  describe('modificarEstadoRespuestaNovedadAsesor', () => {
    it('llama PATCH /solicitudes/novedad-asesor/{solicitudId}/respuesta/estado con solo { nuevoEstado } y resuelve undefined', async () => {
      // Arrange
      patch.mockResolvedValue({ status: 204, data: '' });

      // Act
      const resultado = await solicitudesService.modificarEstadoRespuestaNovedadAsesor({
        solicitudId: 'abc',
        nuevoEstado: 'NO_APROBADA',
      });

      // Assert
      expect(patch).toHaveBeenCalledWith('/solicitudes/novedad-asesor/abc/respuesta/estado', {
        nuevoEstado: 'NO_APROBADA',
      });
      expect(resultado).toBeUndefined();
    });
  });

  describe('modificarEstadoRespuestaCambioAsesor', () => {
    it('llama PATCH /solicitudes/cambio-asesor/{solicitudId}/respuesta/estado con solo { nuevoEstado } y resuelve undefined', async () => {
      // Arrange
      patch.mockResolvedValue({ status: 204, data: '' });

      // Act
      const resultado = await solicitudesService.modificarEstadoRespuestaCambioAsesor({
        solicitudId: 'abc',
        nuevoEstado: 'APROBADA',
      });

      // Assert
      expect(patch).toHaveBeenCalledWith('/solicitudes/cambio-asesor/abc/respuesta/estado', {
        nuevoEstado: 'APROBADA',
      });
      expect(resultado).toBeUndefined();
    });
  });
});
