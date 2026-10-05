import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../test-utils/render';
import ErrorSummary, { resumirErrores } from './ErrorSummary';
import type { ErrorDeCampo } from './ErrorSummary';

const ERRORES: ErrorDeCampo[] = [
  { campo: 'identificador', etiqueta: 'Identificador', mensaje: 'Este campo es requerido' },
  { campo: 'email', etiqueta: 'Correo electrónico', mensaje: 'Ingresa un correo válido' },
];

function Formulario({
  errores,
  onIrAlCampo,
}: {
  errores: ErrorDeCampo[];
  onIrAlCampo: (campo: string) => void;
}) {
  return (
    <>
      <input aria-label="Identificador" />
      <ErrorSummary errores={errores} onIrAlCampo={onIrAlCampo} />
    </>
  );
}

describe('ErrorSummary', () => {
  it('se anuncia como alerta con el título en plural o singular, lleva al campo con el clic y no le quita el foco; sin errores no dibuja nada', async () => {
    // Arrange
    const user = userEvent.setup();
    const onIrAlCampo = vi.fn();
    const { rerender } = render(<Formulario errores={[]} onIrAlCampo={onIrAlCampo} />);
    const campo = screen.getByRole('textbox', { name: 'Identificador' });
    await user.click(campo);

    // Assert
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // Act
    rerender(<Formulario errores={ERRORES} onIrAlCampo={onIrAlCampo} />);

    // Assert
    const resumen = screen.getByRole('alert');
    expect(within(resumen).getByText('Revisa 2 campos antes de continuar')).toBeInTheDocument();
    expect(campo).toHaveFocus();

    // Act
    await user.click(
      within(resumen).getByRole('button', {
        name: 'Correo electrónico: Ingresa un correo válido',
      }),
    );

    // Assert
    expect(onIrAlCampo).toHaveBeenCalledTimes(1);
    expect(onIrAlCampo).toHaveBeenCalledWith('email');

    // Act
    rerender(<Formulario errores={ERRORES.slice(0, 1)} onIrAlCampo={onIrAlCampo} />);

    // Assert
    expect(
      within(screen.getByRole('alert')).getByText('Revisa 1 campo antes de continuar'),
    ).toBeInTheDocument();
  });

  it('resumirErrores sigue el orden de las etiquetas e ignora los campos sin mensaje', () => {
    // Arrange
    const etiquetas = {
      identificador: 'Identificador',
      nombres: 'Nombres',
      apellidos: 'Apellidos',
      email: 'Correo electrónico',
    };
    const errores = {
      email: { message: 'Ingresa un correo válido' },
      apellidos: undefined,
      nombres: {},
      identificador: { message: 'Este campo es requerido' },
      contacto: { message: 'Solo se permiten dígitos' },
    };

    // Act
    const resumen = resumirErrores(errores, etiquetas);

    // Assert
    expect(resumen).toEqual([
      { campo: 'identificador', etiqueta: 'Identificador', mensaje: 'Este campo es requerido' },
      { campo: 'email', etiqueta: 'Correo electrónico', mensaje: 'Ingresa un correo válido' },
    ]);
  });
});
