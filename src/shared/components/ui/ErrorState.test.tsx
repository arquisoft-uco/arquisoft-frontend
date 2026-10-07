import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import ErrorState from './ErrorState';

describe('ErrorState', () => {
  it('«Reintentar» llama a onReintentar sin pasarle el evento del clic', async () => {
    // Arrange
    const user = userEvent.setup();
    const onReintentar = vi.fn();
    render(<ErrorState titulo="No se pudo cargar" onReintentar={onReintentar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(onReintentar).toHaveBeenCalledTimes(1);
    expect(onReintentar).toHaveBeenCalledWith();
  });

  it('sin onReintentar no ofrece el botón y se anuncia como alerta', () => {
    // Act
    render(<ErrorState titulo="No se pudo cargar" descripcion="Intenta de nuevo más tarde." />);

    // Assert
    const alerta = screen.getByRole('alert');
    expect(alerta).toHaveTextContent('No se pudo cargar');
    expect(alerta).toHaveTextContent('Intenta de nuevo más tarde.');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
