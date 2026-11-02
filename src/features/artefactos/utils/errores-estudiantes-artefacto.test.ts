import { describe, it, expect } from 'vitest';
import { errorApi } from '../../../test-utils/errores-api';
import { artefactoYaNoDisponible } from './errores-estudiantes-artefacto';

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
