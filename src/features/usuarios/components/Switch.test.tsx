import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import Switch from './Switch';

const DESCRIPCION = 'Acompaña proyectos de grado.';

describe('Switch', () => {
  it('alterna con el clic, con su etiqueta y con Espacio, y expone su nombre y su descripción', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCambiar = vi.fn();
    const { rerender } = render(
      <Switch marcado={false} onCambiar={onCambiar} etiqueta="Asesor" descripcion={DESCRIPCION} />,
    );
    const interruptor = screen.getByRole('switch', { name: 'Asesor', description: DESCRIPCION });

    // Assert
    expect(interruptor).not.toBeChecked();

    // Act
    await user.tab();
    await user.keyboard(' ');
    await user.click(interruptor);
    await user.click(screen.getByText('Asesor'));

    // Assert
    expect(interruptor).toHaveFocus();
    expect(onCambiar.mock.calls).toEqual([[true], [true], [true]]);

    // Act
    rerender(<Switch marcado onCambiar={onCambiar} etiqueta="Asesor" descripcion={DESCRIPCION} />);
    await user.click(interruptor);

    // Assert
    expect(interruptor).toBeChecked();
    expect(onCambiar).toHaveBeenCalledTimes(4);
    expect(onCambiar).toHaveBeenLastCalledWith(false);
  });

  it('con "pendiente" expone aria-busy, no vuelve a llamar a onCambiar y conserva el foco', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCambiar = vi.fn();
    const { rerender } = render(<Switch marcado={false} onCambiar={onCambiar} etiqueta="Asesor" />);
    const interruptor = screen.getByRole('switch', { name: 'Asesor' });
    await user.tab();
    await user.keyboard(' ');

    // Act
    rerender(<Switch marcado={false} onCambiar={onCambiar} etiqueta="Asesor" pendiente />);

    // Assert
    expect(interruptor).toHaveAttribute('aria-busy', 'true');
    expect(interruptor).toHaveAttribute('aria-disabled', 'true');
    expect(interruptor).toBeEnabled();
    expect(interruptor).toHaveFocus();

    // Act
    await user.keyboard(' ');
    await user.click(interruptor);

    // Assert
    expect(onCambiar).toHaveBeenCalledTimes(1);
    expect(interruptor).toHaveFocus();
  });

  it('con "deshabilitado" no se acciona ni con el clic ni con su etiqueta', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCambiar = vi.fn();
    render(<Switch marcado={false} onCambiar={onCambiar} etiqueta="Jurado" deshabilitado />);
    const interruptor = screen.getByRole('switch', { name: 'Jurado' });

    // Act
    await user.click(interruptor);
    await user.click(screen.getByText('Jurado'));

    // Assert
    expect(interruptor).toBeDisabled();
    expect(onCambiar).not.toHaveBeenCalled();
  });
});
