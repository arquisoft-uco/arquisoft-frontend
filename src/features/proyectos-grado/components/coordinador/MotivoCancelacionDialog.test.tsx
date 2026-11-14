import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { render, screen } from '../../../../test-utils/render';
import { LIMITES, MENSAJES_VALIDACION, textoRequerido } from '../../../../shared/validation';
import MotivoCancelacionDialog from './MotivoCancelacionDialog';

const schema = z.object({
  motivo: textoRequerido(LIMITES.MOTIVO_CANCELACION_PROYECTO_GRADO_MAX),
});

function Pantalla() {
  const formulario = useForm<{ motivo: string }>({
    resolver: zodResolver(schema),
    defaultValues: { motivo: '' },
    mode: 'onTouched',
  });
  return (
    <MotivoCancelacionDialog
      titulo="Sistema"
      formulario={formulario}
      onContinuar={vi.fn()}
      onCerrar={vi.fn()}
    />
  );
}

describe('MotivoCancelacionDialog', () => {
  it('avisa que no se puede revertir, muestra el contador y escribir lo actualiza', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<Pantalla />);

    // Assert
    expect(screen.getByText('Cancelar un proyecto no se puede revertir.')).toBeInTheDocument();
    expect(screen.getByText(/0\s*\/\s*500/)).toBeInTheDocument();

    // Act
    await user.type(screen.getByRole('textbox', { name: /Motivo de la cancelación/ }), 'abc');

    // Assert
    expect(screen.getByText(/3\s*\/\s*500/)).toBeInTheDocument();
  });

  it('al salir del campo vacío muestra el error de obligatorio como alert', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<Pantalla />);

    // Act
    await user.click(screen.getByRole('textbox', { name: /Motivo de la cancelación/ }));
    await user.tab();

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent(MENSAJES_VALIDACION.requerido);
  });
});
