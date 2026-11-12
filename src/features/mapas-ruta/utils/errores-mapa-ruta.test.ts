import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import {
  campoDeErrorAgregarPlanEstimado,
  campoDeErrorAsignarTarea,
  campoDeErrorMapaRuta,
  campoDeErrorModificarPlanEstimado,
  campoDeErrorModificarPlanReal,
  campoDeErrorModificarTarea,
  mensajeErrorAgregarPlanEstimado,
  mensajeErrorAsignarTarea,
  mensajeErrorCambioEstadoTarea,
  mensajeErrorCambioFechaFin,
  mensajeErrorEliminarPlanEstimado,
  mensajeErrorEliminarTarea,
  mensajeErrorMapaRuta,
  mensajeErrorModificarPlanEstimado,
  mensajeErrorModificarPlanReal,
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

  it('eliminar tarea: traduce los códigos conocidos, y si no, usa el message o el respaldo', () => {
    // Act / Assert
    expect(mensajeErrorEliminarTarea(errorApi('TAREA_NO_REMOVIBLE'))).toContain(
      'ya no se puede eliminar en su estado actual',
    );
    expect(mensajeErrorEliminarTarea(errorApi('TAREA_NO_ENCONTRADA'))).toContain(
      'La tarea ya no está disponible',
    );
    expect(mensajeErrorEliminarTarea(errorApi('OTRO', 'Algo falló'))).toBe('Algo falló');
    expect(mensajeErrorEliminarTarea(new Error('red'))).toBe('Inténtalo nuevamente.');
  });

  it.each([
    ['MAPA_RUTA_NO_ENCONTRADO', 'Tu mapa de ruta ya no está disponible', null],
    ['PROYECTO_GRADO_NO_EN_PROCESO', 'ya no está en proceso y no admite nuevas tareas', null],
    ['TAREA_DUPLICADA', 'Ya hay una tarea con esa descripción', 'descripcion'],
    ['ASESOR_NO_ASIGNADO_PROYECTO_GRADO', 'no está asignado a tu proyecto', 'asesor'],
  ])('asignar tarea: %s se traduce a texto propio y a su campo', (codigo, texto, campo) => {
    // Arrange
    const err = errorApi(codigo);

    // Act / Assert
    expect(mensajeErrorAsignarTarea(err)).toContain(texto);
    expect(campoDeErrorAsignarTarea(err)).toBe(campo);
  });

  it('asignar tarea: código desconocido usa el message y sin payload el respaldo', () => {
    // Act / Assert
    expect(mensajeErrorAsignarTarea(errorApi('OTRO', 'Algo falló'))).toBe('Algo falló');
    expect(mensajeErrorAsignarTarea(new Error('red'))).toBe(
      'Verifica los datos e inténtalo nuevamente.',
    );
    expect(campoDeErrorAsignarTarea(errorApi('OTRO'))).toBeNull();
  });
  it.each([
    ['TAREA_NO_ENCONTRADA', 'La tarea ya no está disponible', null],
    ['PLAN_ESTIMADO_DUPLICADO', 'Esta tarea ya tiene un plan estimado.', null],
    ['PLAN_ESTIMADO_TIEMPO_EXCEDE_PLAZO', 'Excede 30 días', 'tiempoEstimadoDias'],
  ])(
    'agregar plan estimado: %s se traduce y solo el exceso apunta a un campo',
    (codigo, texto, campo) => {
      // Arrange
      const err = errorApi(codigo, 'Excede 30 días');

      // Act / Assert
      expect(mensajeErrorAgregarPlanEstimado(err)).toContain(texto);
      expect(campoDeErrorAgregarPlanEstimado(err)).toBe(campo);
    },
  );

  it('agregar plan estimado: código desconocido usa el message y sin payload el respaldo', () => {
    // Act / Assert
    expect(mensajeErrorAgregarPlanEstimado(errorApi('OTRO', 'Algo falló'))).toBe('Algo falló');
    expect(mensajeErrorAgregarPlanEstimado(new Error('red'))).toBe(
      'Verifica los datos e inténtalo nuevamente.',
    );
    expect(campoDeErrorAgregarPlanEstimado(errorApi('OTRO'))).toBeNull();
  });

  it('modificar plan estimado: texto propio si no existe y campo solo si es demasiado larga', () => {
    // Act / Assert
    expect(mensajeErrorModificarPlanEstimado(errorApi('PLAN_ESTIMADO_NO_ENCONTRADO'))).toContain(
      'ya no está disponible',
    );
    expect(mensajeErrorModificarPlanEstimado(errorApi('OTRO', 'Algo falló'))).toBe('Algo falló');
    expect(mensajeErrorModificarPlanEstimado(new Error('red'))).toBe(
      'Verifica los datos e inténtalo nuevamente.',
    );
    expect(
      campoDeErrorModificarPlanEstimado(errorApi('PLAN_ESTIMADO_DESCRIPCION_DEMASIADO_LARGA')),
    ).toBe('descripcionEstimado');
    expect(campoDeErrorModificarPlanEstimado(errorApi('PLAN_ESTIMADO_NO_ENCONTRADO'))).toBeNull();
  });

  it('modificar plan real: texto propio si no existe, respaldo y campo de cada código', () => {
    // Act / Assert
    expect(mensajeErrorModificarPlanReal(errorApi('PLAN_REAL_NO_ENCONTRADO'))).toContain(
      'ya no está disponible',
    );
    expect(mensajeErrorModificarPlanReal(errorApi('OTRO', 'Algo falló'))).toBe('Algo falló');
    expect(mensajeErrorModificarPlanReal(new Error('red'))).toBe(
      'Verifica los datos e inténtalo nuevamente.',
    );
    expect(campoDeErrorModificarPlanReal(errorApi('PLAN_REAL_TIEMPO_REQUERIDO'))).toBe(
      'tiempoRealDias',
    );
    expect(campoDeErrorModificarPlanReal(errorApi('PLAN_REAL_TIEMPO_INVALIDO'))).toBe(
      'tiempoRealDias',
    );
    expect(campoDeErrorModificarPlanReal(errorApi('PLAN_REAL_DESCRIPCION_DEMASIADO_LARGA'))).toBe(
      'descripcionReal',
    );
    expect(campoDeErrorModificarPlanReal(errorApi('PLAN_REAL_NO_ENCONTRADO'))).toBeNull();
  });

  it('eliminar plan estimado: texto propio si no existe y si no el mensaje del backend o el respaldo', () => {
    // Act / Assert
    expect(mensajeErrorEliminarPlanEstimado(errorApi('PLAN_ESTIMADO_NO_ENCONTRADO'))).toContain(
      'ya no está disponible',
    );
    expect(mensajeErrorEliminarPlanEstimado(errorApi('OTRO', 'Algo falló'))).toBe('Algo falló');
    expect(mensajeErrorEliminarPlanEstimado(new Error('red'))).toBe(
      'No se pudo remover el plan estimado. Inténtalo de nuevo.',
    );
  });
});
