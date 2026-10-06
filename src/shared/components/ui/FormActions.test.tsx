import type { ComponentProps, FormEvent } from 'react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import FormActions from './FormActions';

const ID_FORMULARIO = 'editar-usuario';

type PropsPie = Omit<ComponentProps<typeof FormActions>, 'formId'>;

// El pie vive fuera del <form>: solo el atributo form lo une. El campo vacío y obligatorio deja el
// formulario inválido a propósito (noValidate, como en la app): el botón no debe enterarse.
function PieFueraDelFormulario({
  onSubmit,
  ...pie
}: PropsPie & { onSubmit: (evento: FormEvent) => void }) {
  return (
    <>
      <form id={ID_FORMULARIO} noValidate onSubmit={onSubmit}>
        <input type="email" aria-label="Correo electrónico" required />
      </form>
      <FormActions formId={ID_FORMULARIO} {...pie} />
    </>
  );
}

describe('FormActions', () => {
  it('el botón principal envía el formulario de formId y solo se deshabilita enviando o sin cambios, nunca por validez', async () => {
    // Arrange
    const user = userEvent.setup();
    const onSubmit = vi.fn((evento: FormEvent) => evento.preventDefault());
    const base = {
      accion: 'Guardar cambios',
      accionEnviando: 'Guardando…',
      onCancelar: vi.fn(),
      onSubmit,
    };
    const { rerender } = render(<PieFueraDelFormulario {...base} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    // Assert
    expect(screen.getByRole('textbox', { name: 'Correo electrónico' })).toBeInvalid();
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeEnabled();
    expect(onSubmit).toHaveBeenCalledTimes(1);

    // Act
    rerender(<PieFueraDelFormulario {...base} sinCambios />);
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    // Assert
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled();
    expect(onSubmit).toHaveBeenCalledTimes(1);

    // Act
    rerender(<PieFueraDelFormulario {...base} enviando />);
    await user.click(screen.getByRole('button', { name: 'Guardando…' }));

    // Assert
    const enviando = screen.getByRole('button', { name: 'Guardando…' });
    expect(enviando).toBeDisabled();
    expect(enviando).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('button', { name: 'Guardar cambios' })).not.toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('el botón secundario dice «Cerrar» sin cambios y «Cancelar» con ellos, llama a onCancelar y se deshabilita enviando', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCancelar = vi.fn();
    const { rerender } = render(<FormActions accion="Guardar cambios" onCancelar={onCancelar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    // Assert
    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument();
    expect(onCancelar).toHaveBeenCalledTimes(1);

    // Act
    rerender(<FormActions accion="Guardar cambios" sucio onCancelar={onCancelar} />);
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(screen.queryByRole('button', { name: 'Cerrar' })).not.toBeInTheDocument();
    expect(onCancelar).toHaveBeenCalledTimes(2);

    // Act
    rerender(<FormActions accion="Guardar cambios" sucio enviando onCancelar={onCancelar} />);
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    expect(onCancelar).toHaveBeenCalledTimes(2);
  });

  it('nota reemplaza el texto de estado y sin accion solo queda el botón secundario', () => {
    // Arrange
    const { rerender } = render(<FormActions onCancelar={vi.fn()} />);

    // Assert
    expect(screen.getByText('Sin cambios')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Cerrar');

    // Act
    rerender(<FormActions sucio onCancelar={vi.fn()} />);

    // Assert
    expect(screen.getByText('Cambios sin guardar')).toBeInTheDocument();
    expect(screen.queryByText('Sin cambios')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Cancelar');

    // Act
    rerender(<FormActions sucio nota="Cada rol se aplica al instante." onCancelar={vi.fn()} />);

    // Assert
    expect(screen.getByText('Cada rol se aplica al instante.')).toBeInTheDocument();
    expect(screen.queryByText('Cambios sin guardar')).not.toBeInTheDocument();
  });
});
