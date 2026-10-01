import { describe, it, expect } from 'vitest';
import { nombreEstadoUsuario } from './estados-usuario';
import type { EstadoUsuario } from '../models/EstadoUsuario';

const ESTADOS: EstadoUsuario[] = [
  { id: 'ACTIVO', nombre: 'Activo', descripcion: 'Puede operar' },
  { id: 'INACTIVO', nombre: 'Inactivo', descripcion: 'Sin acceso' },
];

describe('nombreEstadoUsuario', () => {
  it('devuelve el nombre del catálogo y recurre al id si no hay catálogo o no coincide', () => {
    // Act / Assert
    expect(nombreEstadoUsuario(ESTADOS, 'INACTIVO')).toBe('Inactivo');
    expect(nombreEstadoUsuario(ESTADOS, 'SUSPENDIDO')).toBe('SUSPENDIDO');
    expect(nombreEstadoUsuario(undefined, 'ACTIVO')).toBe('ACTIVO');
  });
});
