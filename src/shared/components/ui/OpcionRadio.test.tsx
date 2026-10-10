import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import OpcionRadio from './OpcionRadio';

const propsBase = {
  nombre: 'decision',
  valor: 'aprobar',
  titulo: 'Aprobar la ficha',
  descripcion: 'Pasa a aprobada.',
  elegida: false,
  onElegir: vi.fn(),
};

describe('OpcionRadio', () => {
  it('expone nombre y descripción accesibles y avisa el valor al elegirla', async () => {
    // Arrange
    const user = userEvent.setup();
    const onElegir = vi.fn();
    render(<OpcionRadio {...propsBase} onElegir={onElegir} />);
    const radio = screen.getByRole('radio', { name: 'Aprobar la ficha' });

    // Act
    await user.click(radio);

    // Assert
    expect(radio).toHaveAccessibleDescription('Pasa a aprobada.');
    expect(onElegir).toHaveBeenCalledWith('aprobar');
  });

  it('deshabilitada no se puede elegir', async () => {
    // Arrange
    const user = userEvent.setup();
    const onElegir = vi.fn();
    render(<OpcionRadio {...propsBase} deshabilitada onElegir={onElegir} />);
    const radio = screen.getByRole('radio', { name: 'Aprobar la ficha' });

    // Act
    await user.click(radio);

    // Assert
    expect(radio).toBeDisabled();
    expect(onElegir).not.toHaveBeenCalled();
  });

  it('refleja si está elegida', () => {
    // Arrange / Act
    render(<OpcionRadio {...propsBase} elegida />);

    // Assert
    expect(screen.getByRole('radio', { name: 'Aprobar la ficha' })).toBeChecked();
  });
});
