import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import RowMenu from './RowMenu';
import type { AccionMenu } from './RowMenu';

const ETIQUETA = 'Acciones de Marta Ríos';

function crearAcciones(alSeleccionarBaja: () => void = vi.fn()) {
  const onEditar = vi.fn();
  const onCambiarRoles = vi.fn();
  const acciones: AccionMenu[] = [
    { etiqueta: 'Editar', onSeleccionar: onEditar },
    { etiqueta: 'Cambiar roles', onSeleccionar: onCambiarRoles, deshabilitada: true },
    { etiqueta: 'Dar de baja…', onSeleccionar: alSeleccionarBaja, peligro: true },
  ];
  return { acciones, onEditar, onCambiarRoles };
}

describe('RowMenu', () => {
  it('abre el menú desde el disparador y enfoca la primera acción habilitada', async () => {
    // Arrange
    const user = userEvent.setup();
    const { acciones } = crearAcciones();
    render(<RowMenu etiqueta={ETIQUETA} acciones={acciones} />);
    const disparador = screen.getByRole('button', { name: ETIQUETA });

    // Assert
    expect(disparador).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    // Act
    await user.click(disparador);

    // Assert
    const menu = screen.getByRole('menu', { name: ETIQUETA });
    expect(disparador).toHaveAttribute('aria-expanded', 'true');
    expect(disparador).toHaveAttribute('aria-controls', menu.id);
    expect(screen.getByRole('menuitem', { name: 'Editar' })).toHaveFocus();
  });

  it('las flechas, Inicio y Fin mueven el foco con vuelta y saltan las acciones deshabilitadas', async () => {
    // Arrange
    const user = userEvent.setup();
    const { acciones } = crearAcciones();
    render(<RowMenu etiqueta={ETIQUETA} acciones={acciones} />);
    await user.click(screen.getByRole('button', { name: ETIQUETA }));
    const editar = screen.getByRole('menuitem', { name: 'Editar' });
    const darDeBaja = screen.getByRole('menuitem', { name: 'Dar de baja…' });

    // Act
    await user.keyboard('{ArrowDown}');

    // Assert
    expect(darDeBaja).toHaveFocus();

    // Act
    await user.keyboard('{ArrowDown}');

    // Assert
    expect(editar).toHaveFocus();

    // Act
    await user.keyboard('{ArrowUp}');

    // Assert
    expect(darDeBaja).toHaveFocus();

    // Act
    await user.keyboard('{Home}');

    // Assert
    expect(editar).toHaveFocus();

    // Act
    await user.keyboard('{End}');

    // Assert
    expect(darDeBaja).toHaveFocus();
  });

  it('seleccionar devuelve el foco al disparador, cierra el menú y llama a la acción una sola vez', async () => {
    // Arrange
    const user = userEvent.setup();
    let focoAlSeleccionar: Element | null = null;
    const alSeleccionarBaja = vi.fn(() => {
      focoAlSeleccionar = document.activeElement;
    });
    const { acciones } = crearAcciones(alSeleccionarBaja);
    render(<RowMenu etiqueta={ETIQUETA} acciones={acciones} />);
    const disparador = screen.getByRole('button', { name: ETIQUETA });
    await user.click(disparador);

    // Act
    await user.click(screen.getByRole('menuitem', { name: 'Dar de baja…' }));

    // Assert
    expect(alSeleccionarBaja).toHaveBeenCalledTimes(1);
    expect(focoAlSeleccionar).toBe(disparador);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(disparador).toHaveFocus();
  });

  it('Esc y Tab cierran el menú devolviendo el foco al disparador, y un clic fuera lo cierra sin moverlo', async () => {
    // Arrange
    const user = userEvent.setup();
    const { acciones } = crearAcciones();
    render(
      <>
        <RowMenu etiqueta={ETIQUETA} acciones={acciones} />
        <button type="button">Fuera del menú</button>
      </>,
    );
    const disparador = screen.getByRole('button', { name: ETIQUETA });
    const fuera = screen.getByRole('button', { name: 'Fuera del menú' });

    // Act
    await user.click(disparador);
    await user.keyboard('{Escape}');

    // Assert
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(disparador).toHaveFocus();

    // Act
    await user.click(disparador);
    await user.keyboard('{Tab}');

    // Assert
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(disparador).toHaveFocus();

    // Act
    await user.click(disparador);
    await user.click(fuera);

    // Assert
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(fuera).toHaveFocus();
  });

  it('una acción deshabilitada no se puede seleccionar y deja el menú abierto', async () => {
    // Arrange
    const user = userEvent.setup();
    const { acciones, onCambiarRoles } = crearAcciones();
    render(<RowMenu etiqueta={ETIQUETA} acciones={acciones} />);
    await user.click(screen.getByRole('button', { name: ETIQUETA }));
    const deshabilitada = screen.getByRole('menuitem', { name: 'Cambiar roles' });

    // Act
    await user.click(deshabilitada);

    // Assert
    expect(deshabilitada).toBeDisabled();
    expect(onCambiarRoles).not.toHaveBeenCalled();
    expect(screen.getByRole('menu', { name: ETIQUETA })).toBeInTheDocument();
  });
});
