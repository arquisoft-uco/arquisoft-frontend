import { describe, it, expect } from 'vitest';
import { pasosRutaAcademica } from './ruta-academica';
import { Rol } from '../../../shared/models/rol';

describe('pasosRutaAcademica', () => {
  it('para el estudiante, Evaluaciones no queda disponible y Fichas de perfil sí', () => {
    // Act
    const pasos = pasosRutaAcademica(Rol.Estudiante);

    // Assert
    expect(pasos.find((p) => p.path === '/evaluaciones')?.disponible).toBe(false);
    expect(pasos.find((p) => p.path === '/fichas-perfil')?.disponible).toBe(true);
  });

  it('para el jurado, Evaluaciones queda disponible', () => {
    // Act
    const pasos = pasosRutaAcademica(Rol.Jurado);

    // Assert
    expect(pasos.find((p) => p.path === '/evaluaciones')?.disponible).toBe(true);
  });
});
