import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import {
  campoDeErrorMapaRuta,
  campoDeErrorModificarTarea,
  mensajeErrorCambioEstadoTarea,
  mensajeErrorCambioFechaFin,
  mensajeErrorMapaRuta,
  mensajeErrorModificarTarea,
} from './errores-mapa-ruta';
import { MENSAJES_VALIDACION } from '../../../shared/validation';

function errorApi(errorCode: string, message = 'mensaje crudo del backend') {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Unprocessable Entity', errorCode, message, status: 422 },
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('errores-mapa-ruta', () => {
  it.each([
    ['PROYECTO_GRADO_NO_ENCONTRADO', 'El proyecto ya no está disponible', 'proyectoGrado'],
    ['PROYECTO_GRADO_NO_PROPIETARIO', 'Solo el coordinador asignado', 'proyectoGrado'],
    ['PROYECTO_GRADO_NO_EN_PROCESO', 'ya no está en proceso', 'proyectoGrado'],
    ['MAPA_RUTA_DUPLICADO', 'ya tiene un mapa de ruta', 'proyectoGrado'],
    ['MAPA_RUTA_FECHA_FIN_NO_POSTERIOR', 'debe ser posterior', 'fechaFin'],
  ])('%s se traduce a texto propio y se atribuye a su campo', (codigo, texto, campo) => {
    // Arrange
    const err = errorApi(codigo);

    // Act / Assert
    expect(mensajeErrorMapaRuta(err)).toContain(texto);
    expect(campoDeErrorMapaRuta(err)).toBe(campo);
  });

  it('un código desconocido usa el message del backend y no se atribuye a un campo', () => {
    // Arrange
    const err = errorApi('OTRO_CODIGO', 'Algo falló');

    // Act / Assert
    expect(mensajeErrorMapaRuta(err)).toBe('Algo falló');
    expect(campoDeErrorMapaRuta(err)).toBeNull();
  });

  it('un error sin payload usa el mensaje por defecto', () => {
    // Act / Assert
    expect(mensajeErrorMapaRuta(new Error('red'))).toBe(
      'Verifica los datos e inténtalo nuevamente.',
    );
  });

  it.each([
    ['MAPA_RUTA_NO_ENCONTRADO', 'ya no está disponible'],
    ['PROYECTO_GRADO_NO_PROPIETARIO', 'Solo el coordinador asignado'],
    ['PROYECTO_GRADO_NO_EN_PROCESO', 'ya no está en proceso'],
    ['MAPA_RUTA_FECHA_FIN_NO_POSTERIOR', MENSAJES_VALIDACION.fechaFinPosterior],
  ])('cambio de fecha de fin: %s se traduce a texto propio', (codigo, texto) => {
    // Act / Assert
    expect(mensajeErrorCambioFechaFin(errorApi(codigo))).toContain(texto);
  });

  it.each([
    ['TRANSICION_ESTADO_ITEM_NO_PERMITIDA', 'ya no admite ese cambio de estado'],
    ['TAREA_NO_ENCONTRADA', 'ya no está disponible'],
  ])('cambio de estado de tarea: %s se traduce a texto propio', (codigo, texto) => {
    // Act / Assert
    expect(mensajeErrorCambioEstadoTarea(errorApi(codigo))).toContain(texto);
  });

  it('cambio de estado de tarea: código desconocido usa el message y sin payload el respaldo', () => {
    // Act / Assert
    expect(mensajeErrorCambioEstadoTarea(errorApi('OTRO', 'Algo falló'))).toBe('Algo falló');
    expect(mensajeErrorCambioEstadoTarea(new Error('red'))).toBe('Inténtalo nuevamente.');
  });

  it('cambio de fecha de fin: código desconocido usa el message y sin payload el respaldo', () => {
    // Act / Assert
    expect(mensajeErrorCambioFechaFin(errorApi('OTRO', 'Algo falló'))).toBe('Algo falló');
    expect(mensajeErrorCambioFechaFin(new Error('red'))).toBe(
      'Verifica la fecha e inténtalo nuevamente.',
    );
  });

  it.each([
    ['TAREA_NO_ENCONTRADA', 'La tarea ya no está disponible', null],
    ['TAREA_DUPLICADA', 'Ya hay una tarea con esa descripción', 'descripcion'],
    ['ASESOR_NO_ASIGNADO_PROYECTO_GRADO', 'no está asignado a tu proyecto', 'asesor'],
  ])('modificar tarea: %s se traduce a texto propio y a su campo', (codigo, texto, campo) => {
    // Arrange
    const err = errorApi(codigo);

    // Act / Assert
    expect(mensajeErrorModificarTarea(err)).toContain(texto);
    expect(campoDeErrorModificarTarea(err)).toBe(campo);
  });

  it('modificar tarea: código desconocido usa el message y sin payload el respaldo', () => {
    // Act / Assert
    expect(mensajeErrorModificarTarea(errorApi('OTRO', 'Algo falló'))).toBe('Algo falló');
    expect(mensajeErrorModificarTarea(new Error('red'))).toBe(
      'Verifica los datos e inténtalo nuevamente.',
    );
    expect(campoDeErrorModificarTarea(errorApi('OTRO'))).toBeNull();
  });
});
