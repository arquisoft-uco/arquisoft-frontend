import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import EstadoUsuarioFieldset from './EstadoUsuarioFieldset';
import type { EstadoUsuario } from '../../models/EstadoUsuario';

const ESTADOS: EstadoUsuario[] = [
  { id: 'ACTIVO', nombre: 'Activo', descripcion: 'Con acceso' },
  { id: 'INACTIVO', nombre: 'Inactivo', descripcion: 'Sin acceso' },
];

function renderizar(props: Partial<React.ComponentProps<typeof EstadoUsuarioFieldset>> = {}) {
  const onSolicitar = vi.fn();
  render(
    <EstadoUsuarioFieldset
      estadoActual="ACTIVO"
      estados={ESTADOS}
      cargando={false}
      noDisponible={false}
      pendiente={false}
      onSolicitar={onSolicitar}
      {...props}
    />,
  );
  return { onSolicitar };
}

describe('EstadoUsuarioFieldset', () => {
  it('muestra el estado actual y excluye ese estado de las opciones', () => {
    // Act
    renderizar();

    // Assert
    expect(screen.getByText('Activo', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Inactivo' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Activo' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cambiar estado' })).toBeDisabled();
  });

  it('al elegir un estado habilita el botón y solicita el cambio con ese estado', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onSolicitar } = renderizar();

    // Act
    await user.selectOptions(screen.getByLabelText('Nuevo estado'), 'INACTIVO');
    await user.click(screen.getByRole('button', { name: 'Cambiar estado' }));

    // Assert
    expect(onSolicitar).toHaveBeenCalledWith(ESTADOS[1]);
  });

  it('con el catálogo no disponible muestra el aviso y deshabilita el control', () => {
    // Act
    renderizar({ estados: undefined, noDisponible: true });

    // Assert
    expect(
      screen.getByRole('note', { name: 'No disponible: estados de usuario' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Nuevo estado')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cambiar estado' })).toBeDisabled();
  });

  it.each([
    ['cargando', { cargando: true }],
    ['pendiente', { pendiente: true }],
  ])('deshabilita el control mientras está %s', (_nombre, props) => {
    // Act
    renderizar(props);

    // Assert
    expect(screen.getByLabelText('Nuevo estado')).toBeDisabled();
  });
});
