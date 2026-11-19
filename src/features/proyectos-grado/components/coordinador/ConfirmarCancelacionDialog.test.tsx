import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import ConfirmarCancelacionDialog from './ConfirmarCancelacionDialog';

function montar(sobrescribe: Partial<Parameters<typeof ConfirmarCancelacionDialog>[0]> = {}) {
  const props = {
    titulo: 'Sistema',
    frase: '',
    onCambiarFrase: vi.fn(),
    fraseCoincide: false,
    cancelando: false,
    onConfirmar: vi.fn(),
    onVolver: vi.fn(),
    ...sobrescribe,
  };
  render(<ConfirmarCancelacionDialog {...props} />);
  return props;
}

describe('ConfirmarCancelacionDialog', () => {
  it('muestra las consecuencias y deja la acción deshabilitada mientras la frase no coincide', () => {
    // Act
    montar();

    // Assert
    expect(screen.getByText(/Se borran los archivos de los artefactos/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar proyecto de grado' })).toBeDisabled();
  });

  it('con la frase habilita la acción y confirmar llama a onConfirmar', async () => {
    // Arrange
    const user = userEvent.setup();
    const props = montar({ frase: 'Cancelar proyecto de grado', fraseCoincide: true });

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar proyecto de grado' }));

    // Assert
    expect(props.onConfirmar).toHaveBeenCalledTimes(1);
  });

  it('escribir informa la frase y «Volver» llama a onVolver', async () => {
    // Arrange
    const user = userEvent.setup();
    const props = montar();

    // Act
    await user.type(screen.getByRole('textbox'), 'a');
    await user.click(screen.getByRole('button', { name: 'Volver' }));

    // Assert
    expect(props.onCambiarFrase).toHaveBeenCalledWith('a');
    expect(props.onVolver).toHaveBeenCalledTimes(1);
  });
});
