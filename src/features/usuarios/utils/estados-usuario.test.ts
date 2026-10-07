import { describe, it, expect } from 'vitest';
import { nombreEstadoUsuario, textosCambioEstado } from './estados-usuario';
import type { EstadoUsuario } from '../models/EstadoUsuario';
import type { Usuario } from '../models/Usuario';

const ESTADOS: EstadoUsuario[] = [
  { id: 'ACTIVO', nombre: 'Activo', descripcion: 'Puede operar' },
  { id: 'INACTIVO', nombre: 'Inactivo', descripcion: 'Sin acceso' },
];

function crearUsuario(parcial: Partial<Usuario> = {}): Usuario {
  return {
    id: 'u-1',
    identificador: '2001',
    nombre: 'Marta Ríos',
    email: 'marta@uco.edu.co',
    contacto: '3001234567',
    estado: 'ACTIVO',
    vigente: true,
    esEstudiante: false,
    esAsesor: false,
    esAsesorFicha: false,
    esCoordinador: false,
    esRepresentanteComite: false,
    esAdministrador: false,
    esBibliotecario: false,
    ...parcial,
  };
}

describe('nombreEstadoUsuario', () => {
  it('devuelve el nombre del catálogo y recurre al id si no hay catálogo o no coincide', () => {
    // Act / Assert
    expect(nombreEstadoUsuario(ESTADOS, 'INACTIVO')).toBe('Inactivo');
    expect(nombreEstadoUsuario(ESTADOS, 'SUSPENDIDO')).toBe('SUSPENDIDO');
    expect(nombreEstadoUsuario(undefined, 'ACTIVO')).toBe('ACTIVO');
  });
});

describe('textosCambioEstado', () => {
  it('presenta como restauración el paso a ACTIVO de un usuario dado de baja', () => {
    // Arrange
    const [activo] = ESTADOS;
    const usuarioDeBaja = crearUsuario({ estado: 'INACTIVO', vigente: false });

    // Act
    const textos = textosCambioEstado(usuarioDeBaja, activo, ESTADOS);

    // Assert
    expect(textos).toEqual({
      titulo: '¿Restaurar a Marta Ríos?',
      descripcion:
        'Se cambiará el estado de Marta Ríos de Inactivo a Activo. El usuario será restaurado.',
      labelConfirmar: 'Restaurar usuario',
      exito: { titulo: 'Usuario restaurado', mensaje: 'Marta Ríos volvió a estar vigente.' },
      error: 'No se pudo restaurar al usuario',
    });
  });

  it('al desactivar avisa que se deshabilita el acceso y al activar a quien sigue vigente deja solo la frase base', () => {
    // Arrange
    const [activo, inactivo] = ESTADOS;
    const usuarioActivo = crearUsuario({ estado: 'ACTIVO', vigente: true });
    const usuarioInactivoVigente = crearUsuario({ estado: 'INACTIVO', vigente: true });

    // Act
    const desactivar = textosCambioEstado(usuarioActivo, inactivo, ESTADOS);
    const activarVigente = textosCambioEstado(usuarioInactivoVigente, activo, ESTADOS);

    // Assert
    expect(desactivar).toEqual({
      titulo: '¿Cambiar el estado de Marta Ríos?',
      descripcion:
        'Se cambiará el estado de Marta Ríos de Activo a Inactivo. Se deshabilitará su acceso.',
      labelConfirmar: 'Cambiar estado',
      exito: { titulo: 'Estado cambiado', mensaje: 'Marta Ríos ahora está en estado Inactivo.' },
      error: 'No se pudo cambiar el estado',
    });
    expect(activarVigente).toEqual({
      titulo: '¿Cambiar el estado de Marta Ríos?',
      descripcion: 'Se cambiará el estado de Marta Ríos de Inactivo a Activo.',
      labelConfirmar: 'Cambiar estado',
      exito: { titulo: 'Estado cambiado', mensaje: 'Marta Ríos ahora está en estado Activo.' },
      error: 'No se pudo cambiar el estado',
    });
  });
});
