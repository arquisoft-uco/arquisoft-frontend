import { describe, it, expect } from 'vitest';
import { errorApi } from '../../../test-utils/errores-api';
import {
  artefactoYaNoDisponible,
  mensajeErrorQuitarEstudiante,
} from './errores-estudiantes-artefacto';

function error422(errorCode: string) {
  return errorApi(422, { status: 422, errorCode, message: 'del backend' });
}

describe('artefactoYaNoDisponible', () => {
  it('es verdadero para artefacto no encontrado, omitido o de otro asesor, y falso para el resto', () => {
    // Assert
    expect(artefactoYaNoDisponible(error422('ARTEFACTOS_ARTEFACTO_NO_ENCONTRADO'))).toBe(true);
    expect(artefactoYaNoDisponible(error422('ARTEFACTOS_ARTEFACTO_OMITIDO'))).toBe(true);
    expect(artefactoYaNoDisponible(error422('ARTEFACTOS_ARTEFACTO_ASESOR_NO_PROPIETARIO'))).toBe(
      true,
    );
    expect(
      artefactoYaNoDisponible(error422('ESTUDIANTE_ARTEFACTO_ESTUDIANTE_NO_VINCULADO_ARTEFACTO')),
    ).toBe(false);
    expect(artefactoYaNoDisponible(new Error('red'))).toBe(false);
  });
});

describe('mensajeErrorQuitarEstudiante', () => {
  it('devuelve un texto propio por cada 422 conocido y el del backend para el resto', () => {
    // Assert
    expect(
      mensajeErrorQuitarEstudiante(
        error422('ESTUDIANTE_ARTEFACTO_ESTUDIANTE_NO_VINCULADO_ARTEFACTO'),
      ),
    ).toBe('El estudiante ya no está vinculado a este artefacto.');
    expect(mensajeErrorQuitarEstudiante(error422('ARTEFACTOS_ARTEFACTO_OMITIDO'))).toBe(
      'El artefacto está omitido y no admite cambios de estudiantes.',
    );
    expect(mensajeErrorQuitarEstudiante(error422('ARTEFACTOS_ARTEFACTO_NO_ENCONTRADO'))).toBe(
      'El artefacto ya no existe.',
    );
    expect(
      mensajeErrorQuitarEstudiante(error422('ARTEFACTOS_ARTEFACTO_ASESOR_NO_PROPIETARIO')),
    ).toBe('Ya no eres el asesor responsable de este artefacto.');
    expect(mensajeErrorQuitarEstudiante(error422('OTRO_CODIGO'))).toBe('del backend');
    expect(mensajeErrorQuitarEstudiante(new Error('red'))).toBe('Inténtalo nuevamente.');
  });
});
