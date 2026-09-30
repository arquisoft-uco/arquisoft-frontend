import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import UsuariosTable from './UsuariosTable';
import type { Usuario } from '../../models/Usuario';

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
    ...parcial,
  };
}

describe('UsuariosTable', () => {
  it('pinta una insignia solo por cada rol en true', () => {
    // Arrange
    const usuario = crearUsuario({ esEstudiante: true, esCoordinador: true });

    // Act
    render(
      <UsuariosTable
        usuarios={[usuario]}
        totalElements={1}
        totalPages={1}
        page={0}
        pageSize={10}
        onPageChange={() => {}}
        onEditar={() => {}}
        onEliminar={() => {}}
      />,
    );

    // Assert
    expect(screen.getByText('Estudiante')).toBeInTheDocument();
    expect(screen.getByText('Coordinador')).toBeInTheDocument();
    expect(screen.queryByText('Asesor')).not.toBeInTheDocument();
    expect(screen.queryByText('Administrador')).not.toBeInTheDocument();
  });

  it('muestra la fila de vacío cuando no hay usuarios', () => {
    // Act
    render(
      <UsuariosTable
        usuarios={[]}
        totalElements={0}
        totalPages={0}
        page={0}
        pageSize={10}
        onPageChange={() => {}}
        onEditar={() => {}}
        onEliminar={() => {}}
      />,
    );

    // Assert
    expect(screen.getByText('No hay usuarios que coincidan con el filtro.')).toBeInTheDocument();
  });

  it('el botón Editar de una fila invoca onEditar con el usuario de esa fila, no otro', async () => {
    // Arrange
    const user = userEvent.setup();
    const usuarioUno = crearUsuario({ id: 'u-1', nombre: 'Marta Ríos' });
    const usuarioDos = crearUsuario({ id: 'u-2', nombre: 'Carlos Vega' });
    const onEditar = vi.fn();
    render(
      <UsuariosTable
        usuarios={[usuarioUno, usuarioDos]}
        totalElements={2}
        totalPages={1}
        page={0}
        pageSize={10}
        onPageChange={() => {}}
        onEditar={onEditar}
        onEliminar={() => {}}
      />,
    );

    // Act
    await user.click(screen.getByRole('button', { name: `Editar ${usuarioDos.nombre}` }));

    // Assert
    expect(onEditar).toHaveBeenCalledTimes(1);
    expect(onEditar).toHaveBeenCalledWith(usuarioDos);
  });

  it('el botón Eliminar invoca onEliminar con el usuario de su fila', async () => {
    // Arrange
    const user = userEvent.setup();
    const usuarioUno = crearUsuario({ id: 'u-1', nombre: 'Marta Ríos' });
    const usuarioDos = crearUsuario({ id: 'u-2', nombre: 'Carlos Vega' });
    const onEliminar = vi.fn();
    render(
      <UsuariosTable
        usuarios={[usuarioUno, usuarioDos]}
        totalElements={2}
        totalPages={1}
        page={0}
        pageSize={10}
        onPageChange={() => {}}
        onEditar={() => {}}
        onEliminar={onEliminar}
      />,
    );

    // Act
    await user.click(screen.getByRole('button', { name: `Eliminar ${usuarioDos.nombre}` }));

    // Assert
    expect(onEliminar).toHaveBeenCalledTimes(1);
    expect(onEliminar).toHaveBeenCalledWith(usuarioDos);
  });

  it('deshabilita Eliminar con etiqueta explicativa en un usuario dado de baja', async () => {
    // Arrange
    const user = userEvent.setup();
    const onEliminar = vi.fn();
    const usuario = crearUsuario({ nombre: 'Marta Ríos', vigente: false });
    render(
      <UsuariosTable
        usuarios={[usuario]}
        totalElements={1}
        totalPages={1}
        page={0}
        pageSize={10}
        onPageChange={() => {}}
        onEditar={() => {}}
        onEliminar={onEliminar}
      />,
    );

    // Act
    const boton = screen.getByRole('button', { name: 'Marta Ríos ya está eliminado' });
    await user.click(boton);

    // Assert
    expect(boton).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Eliminar Marta Ríos' })).not.toBeInTheDocument();
    expect(onEliminar).not.toHaveBeenCalled();
  });
});
