import { useState, type ComponentProps } from 'react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../test-utils/render';
import ConfirmDialog from './ConfirmDialog';

type PropsDialogo = Omit<
  ComponentProps<typeof ConfirmDialog>,
  'titulo' | 'onConfirmar' | 'onCancelar'
>;

interface PropsPantalla extends PropsDialogo {
  onConfirmar?: () => void;
  onCancelar?: () => void;
}

function Pantalla({ onConfirmar, onCancelar, ...dialogo }: PropsPantalla) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setAbierto(true)}>
        Abrir confirmación
      </button>
      {abierto && (
        <ConfirmDialog
          titulo="¿Quitar el rol Asesor?"
          {...dialogo}
          onConfirmar={() => {
            onConfirmar?.();
            setAbierto(false);
          }}
          onCancelar={() => {
            onCancelar?.();
            setAbierto(false);
          }}
        />
      )}
    </>
  );
}

// El fondo es aria-hidden y no tiene rol: se llega a él desde el diálogo, su hermano anterior.
function fondoDe(dialogo: HTMLElement): HTMLElement {
  const fondo = dialogo.previousElementSibling;
  if (!(fondo instanceof HTMLElement)) throw new Error('El diálogo no tiene fondo');
  return fondo;
}

describe('ConfirmDialog', () => {
  it('enfoca «Cancelar» al abrir, en peligro y en advertencia, y al cerrar devuelve el foco al disparador', async () => {
    // Arrange
    const user = userEvent.setup();
    const { rerender } = render(<Pantalla />);
    const disparador = screen.getByRole('button', { name: 'Abrir confirmación' });

    // Act
    await user.click(disparador);

    // Assert
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(disparador).toHaveFocus();

    // Act
    rerender(<Pantalla variante="advertencia" />);
    await user.click(disparador);

    // Assert
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus();
  });

  it('Esc y el clic en el fondo cancelan', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCancelar = vi.fn();
    render(<Pantalla onCancelar={onCancelar} />);
    const disparador = screen.getByRole('button', { name: 'Abrir confirmación' });
    await user.click(disparador);

    // Act
    await user.keyboard('{Escape}');

    // Assert
    expect(onCancelar).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();

    // Act
    await user.click(disparador);
    await user.click(fondoDe(screen.getByRole('alertdialog')));

    // Assert
    expect(onCancelar).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('con cargando bloquea los botones, muestra «Procesando...» y ni Esc ni el fondo cancelan', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCancelar = vi.fn();
    const onConfirmar = vi.fn();
    render(<Pantalla cargando onCancelar={onCancelar} onConfirmar={onConfirmar} />);
    await user.click(screen.getByRole('button', { name: 'Abrir confirmación' }));
    const dialogo = screen.getByRole('alertdialog');

    // Act
    await user.keyboard('{Escape}');
    await user.click(fondoDe(dialogo));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    await user.click(screen.getByRole('button', { name: 'Procesando...' }));

    // Assert
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Procesando...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Procesando...' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(onCancelar).not.toHaveBeenCalled();
    expect(onConfirmar).not.toHaveBeenCalled();
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('es un alertdialog en peligro y un dialog en advertencia, con nombre y descripción accesibles y las consecuencias listadas', async () => {
    // Arrange
    const user = userEvent.setup();
    const descripcion = 'Se quitará el rol de la cuenta.';
    const consecuencias = ['Perderá el acceso a sus fichas.', 'Podrás volver a asignarle el rol.'];
    const descripcionAccesible = [descripcion, ...consecuencias].join(' ');
    const props = { descripcion, consecuencias };
    const { rerender } = render(<Pantalla {...props} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Abrir confirmación' }));

    // Assert
    const alerta = screen.getByRole('alertdialog');
    expect(alerta).toHaveAttribute('aria-modal', 'true');
    expect(alerta).toHaveAccessibleName('¿Quitar el rol Asesor?');
    expect(alerta).toHaveAccessibleDescription(descripcionAccesible);
    expect(
      within(alerta)
        .getAllByRole('listitem')
        .map((consecuencia) => consecuencia.textContent),
    ).toEqual(consecuencias);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Act
    rerender(<Pantalla {...props} variante="advertencia" />);

    // Assert
    const advertencia = screen.getByRole('dialog');
    expect(advertencia).toHaveAccessibleName('¿Quitar el rol Asesor?');
    expect(advertencia).toHaveAccessibleDescription(descripcionAccesible);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('Tab y Mayús+Tab dan la vuelta dentro del diálogo', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<Pantalla labelConfirmar="Quitar" />);
    await user.click(screen.getByRole('button', { name: 'Abrir confirmación' }));
    const cancelar = screen.getByRole('button', { name: 'Cancelar' });
    const confirmar = screen.getByRole('button', { name: 'Quitar' });

    // Act
    await user.tab();

    // Assert
    expect(confirmar).toHaveFocus();

    // Act
    await user.tab();

    // Assert
    expect(cancelar).toHaveFocus();

    // Act
    await user.tab({ shift: true });

    // Assert
    expect(confirmar).toHaveFocus();
  });

  it('confirmar llama a onConfirmar sin cancelar', async () => {
    // Arrange
    const user = userEvent.setup();
    const onConfirmar = vi.fn();
    const onCancelar = vi.fn();
    render(<Pantalla labelConfirmar="Quitar" onConfirmar={onConfirmar} onCancelar={onCancelar} />);
    await user.click(screen.getByRole('button', { name: 'Abrir confirmación' }));

    // Act
    await user.click(screen.getByRole('button', { name: 'Quitar' }));

    // Assert
    expect(onConfirmar).toHaveBeenCalledTimes(1);
    expect(onCancelar).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});
