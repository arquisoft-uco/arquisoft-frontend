import { describe, it, expect } from 'vitest';
import {
  varianteEstadoEvaluacion,
  varianteEstadoFicha,
  varianteEstadoUsuario,
} from './estado-variante';

describe('varianteEstadoFicha', () => {
  it('asigna su variante a cada estado real de la ficha y deja en neutro lo desconocido', () => {
    // Arrange
    const esperadas = {
      EN_CONSTRUCCION: 'neutro',
      DISPONIBLE_PARA_EVALUACION: 'advertencia',
      APROBADA: 'exito',
      APROBADA_CON_OBSERVACIONES: 'advertencia',
      NO_APROBADA: 'peligro',
      DESCARTADA: 'neutro',
    };

    // Act
    const obtenidas = Object.fromEntries(
      Object.keys(esperadas).map((id) => [id, varianteEstadoFicha(id)]),
    );

    // Assert
    expect(obtenidas).toEqual(esperadas);
    expect(varianteEstadoFicha('ESTADO_INEXISTENTE')).toBe('neutro');
    // Un nombre heredado de Object.prototype no es un estado y no debe leerse de la tabla.
    expect(varianteEstadoFicha('constructor')).toBe('neutro');
  });
});

describe('varianteEstadoEvaluacion', () => {
  it('asigna su variante a cada estado real de la evaluación y deja en neutro lo desconocido', () => {
    // Arrange
    const esperadas = {
      EN_EVALUACION: 'info',
      APROBADA: 'exito',
      APROBADA_CON_OBSERVACIONES: 'advertencia',
      NO_APROBADA: 'peligro',
      DESCARTADA: 'neutro',
    };

    // Act
    const obtenidas = Object.fromEntries(
      Object.keys(esperadas).map((id) => [id, varianteEstadoEvaluacion(id)]),
    );

    // Assert
    expect(obtenidas).toEqual(esperadas);
    expect(varianteEstadoEvaluacion('ESTADO_INEXISTENTE')).toBe('neutro');
  });
});

describe('varianteEstadoUsuario', () => {
  it('sigue la tabla si el usuario está vigente y pinta peligro cuando está dado de baja', () => {
    // Act / Assert
    expect(varianteEstadoUsuario('ACTIVO', true)).toBe('exito');
    expect(varianteEstadoUsuario('INACTIVO', true)).toBe('neutro');
    expect(varianteEstadoUsuario('ESTADO_INEXISTENTE', true)).toBe('neutro');
    expect(varianteEstadoUsuario('ACTIVO', false)).toBe('peligro');
    expect(varianteEstadoUsuario('INACTIVO', false)).toBe('peligro');
  });
});
