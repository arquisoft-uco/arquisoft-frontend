import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import ConfirmarFinalizacionDialog from './ConfirmarFinalizacionDialog';

function montar(sobrescribe: Partial<Parameters<typeof ConfirmarFinalizacionDialog>[0]> = {}) {
  const props = {
    titulo: 'Sistema',
    frase: '',
    onCambiarFrase: vi.fn(),
    fraseCoincide: false,
    finalizando: false,
    onConfirmar: vi.fn(),
    onCancelar: vi.fn(),
    ...sobrescribe,
  };
  render(<ConfirmarFinalizacionDialog {...props} />);
  return props;
}

describe('ConfirmarFinalizacionDialog', () => {
  it('advierte la irreversibilidad y las consecuencias, y deja la acción deshabilitada sin la frase', () => {
    // Act
    montar();

    // Assert
    expect(screen.getByText('Esta acción no se puede revertir.')).toBeInTheDocument();
    expect(screen.getByText(/Se borran los archivos de las versiones/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Finalizar proyecto' })).toBeDisabled();
  });

  it('con la frase habilita la acción y confirmar llama a onConfirmar', async () => {
    // Arrange
    const user = userEvent.setup();
    const props = montar({ frase: 'Finalizar proyecto de grado', fraseCoincide: true });

    // Act
    await user.click(screen.getByRole('button', { name: 'Finalizar proyecto' }));

    // Assert
    expect(props.onConfirmar).toHaveBeenCalledTimes(1);
  });

  it('escribir informa la frase y «Cancelar» llama a onCancelar', async () => {
    // Arrange
    const user = userEvent.setup();
    const props = montar();

    // Act
    await user.type(screen.getByRole('textbox'), 'a');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(props.onCambiarFrase).toHaveBeenCalledWith('a');
    expect(props.onCancelar).toHaveBeenCalledTimes(1);
  });
});
