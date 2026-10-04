import { describe, it, expect } from 'vitest';
import { Rol } from '../../../shared/models/rol';
import type { Usuario } from '../models/Usuario';
import { ROLES_FILTRABLES, ROLES_USUARIO, rolesDeUsuario } from './roles-usuario';

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

describe('rolesDeUsuario', () => {
  it('sin ningún flag en true devuelve un arreglo vacío', () => {
    // Act
    const roles = rolesDeUsuario(crearUsuario());

    // Assert
    expect(roles).toEqual([]);
  });

  it('devuelve solo los roles marcados en true, en el orden del catálogo', () => {
    // Arrange
    const usuario = crearUsuario({
      esAdministrador: true,
      esEstudiante: true,
      esCoordinador: true,
    });

    // Act
    const roles = rolesDeUsuario(usuario);

    // Assert
    expect(roles).toEqual([Rol.Estudiante, Rol.Coordinador, Rol.Administrador]);
  });

  it('suma al bibliotecario al final del catálogo, aunque no sea un rol filtrable', () => {
    // Arrange
    const soloBibliotecario = crearUsuario({ esBibliotecario: true });
    const varios = crearUsuario({
      esAdministrador: true,
      esBibliotecario: true,
      esEstudiante: true,
    });
    const filtrables = ROLES_FILTRABLES.map(({ rol }) => rol);

    // Act
    const rolesDelBibliotecario = rolesDeUsuario(soloBibliotecario);
    const rolesDeVarios = rolesDeUsuario(varios);

    // Assert
    expect(rolesDelBibliotecario).toEqual([Rol.Bibliotecario]);
    expect(rolesDeVarios).toEqual([Rol.Estudiante, Rol.Administrador, Rol.Bibliotecario]);
    expect(filtrables).toEqual([
      Rol.Estudiante,
      Rol.Asesor,
      Rol.AsesorFicha,
      Rol.Coordinador,
      Rol.RepresentanteComiteCurriculum,
      Rol.Administrador,
    ]);
    expect(ROLES_USUARIO.map(({ rol }) => rol)).toEqual(expect.arrayContaining(filtrables));
  });
});
