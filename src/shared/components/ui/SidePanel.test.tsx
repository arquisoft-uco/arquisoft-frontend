import { useState } from 'react';
import { describe, it, expect, vi, onTestFinished } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import SidePanel from './SidePanel';
import { fondoDe } from '../../../test-utils/dom';

const TITULO_DESCARTAR = '¿Descartar los cambios?';

interface PropsPantalla {
  sucio?: boolean;
  ocupado?: boolean;
  onCerrar?: () => void;
}

function Pantalla({ sucio, ocupado, onCerrar }: PropsPantalla) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setAbierto(true)}>
        Abrir panel
      </button>
      {abierto && (
        <SidePanel
          titulo="Editar usuario"
          descripcion="Cambia los datos de la cuenta."
          sucio={sucio}
          ocupado={ocupado}
          onCerrar={() => {
            onCerrar?.();
            setAbierto(false);
          }}
          pie={(solicitarCierre) => (
            <button type="button" onClick={solicitarCierre}>
              Cancelar
            </button>
          )}
        >
          <input aria-label="Nombre completo" />
          <input aria-label="Correo electrónico" />
        </SidePanel>
      )}
    </>
  );
}

describe('SidePanel', () => {
  it('abre como diálogo modal con nombre y descripción accesibles, enfoca el primer campo y atrapa Tab y Mayús+Tab', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<Pantalla />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Abrir panel' }));

    // Assert
    const panel = screen.getByRole('dialog', { name: 'Editar usuario' });
    expect(panel).toHaveAttribute('aria-modal', 'true');
    expect(panel).toHaveAccessibleDescription('Cambia los datos de la cuenta.');
    expect(screen.getByRole('textbox', { name: 'Nombre completo' })).toHaveFocus();

    // Act
    await user.tab();
    await user.tab();

    // Assert
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus();

    // Act
    await user.tab();

    // Assert
    expect(screen.getByRole('button', { name: 'Cerrar panel' })).toHaveFocus();

    // Act
    await user.tab({ shift: true });

    // Assert
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus();
  });

  it('el ✕, Esc y el clic en el fondo lo cierran y devuelven el foco al disparador', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<Pantalla />);
    const disparador = screen.getByRole('button', { name: 'Abrir panel' });

    // Act
    await user.click(disparador);
    await user.click(screen.getByRole('button', { name: 'Cerrar panel' }));

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(disparador).toHaveFocus();

    // Act
    await user.click(disparador);
    await user.keyboard('{Escape}');

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(disparador).toHaveFocus();

    // Act
    await user.click(disparador);
    await user.click(fondoDe(screen.getByRole('dialog', { name: 'Editar usuario' })));

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(disparador).toHaveFocus();
  });

  it('con cambios sin guardar, Esc, el ✕ y «Cancelar» del pie piden descartar; «Seguir editando» conserva el panel y el foco y «Descartar» lo cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    render(<Pantalla sucio onCerrar={onCerrar} />);
    const disparador = screen.getByRole('button', { name: 'Abrir panel' });
    await user.click(disparador);
    const campo = screen.getByRole('textbox', { name: 'Nombre completo' });
    const equis = screen.getByRole('button', { name: 'Cerrar panel' });
    const cancelar = screen.getByRole('button', { name: 'Cancelar' });

    // Act
    await user.keyboard('{Escape}');

    // Assert
    expect(screen.getByRole('dialog', { name: TITULO_DESCARTAR })).toHaveAccessibleDescription(
      'Tienes cambios sin guardar. Si cierras ahora, se perderán.',
    );
    expect(screen.getByRole('button', { name: 'Seguir editando' })).toHaveFocus();
    expect(onCerrar).not.toHaveBeenCalled();

    // Act
    await user.click(screen.getByRole('button', { name: 'Seguir editando' }));

    // Assert
    expect(screen.queryByRole('dialog', { name: TITULO_DESCARTAR })).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Editar usuario' })).toBeInTheDocument();
    expect(campo).toHaveFocus();

    // Act
    await user.click(equis);

    // Assert
    expect(screen.getByRole('dialog', { name: TITULO_DESCARTAR })).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Seguir editando' }));

    // Assert
    expect(screen.queryByRole('dialog', { name: TITULO_DESCARTAR })).not.toBeInTheDocument();
    expect(equis).toHaveFocus();

    // Act
    await user.click(cancelar);

    // Assert
    expect(screen.getByRole('dialog', { name: TITULO_DESCARTAR })).toBeInTheDocument();
    expect(onCerrar).not.toHaveBeenCalled();

    // Act
    await user.click(screen.getByRole('button', { name: 'Seguir editando' }));

    // Assert
    expect(screen.queryByRole('dialog', { name: TITULO_DESCARTAR })).not.toBeInTheDocument();
    expect(cancelar).toHaveFocus();

    // Act
    await user.click(cancelar);
    await user.click(screen.getByRole('button', { name: 'Descartar' }));

    // Assert
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(disparador).toHaveFocus();
  });

  it('un clic en el fondo con cambios no quita el foco al campo y «Seguir editando» se lo devuelve', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<Pantalla sucio />);
    await user.click(screen.getByRole('button', { name: 'Abrir panel' }));
    const campo = screen.getByRole('textbox', { name: 'Nombre completo' });
    const fondo = fondoDe(screen.getByRole('dialog', { name: 'Editar usuario' }));

    // Act
    await user.pointer({ keys: '[MouseLeft>]', target: fondo });

    // Assert
    expect(campo).toHaveFocus();

    // Act
    await user.pointer({ keys: '[/MouseLeft]' });

    // Assert
    expect(screen.getByRole('dialog', { name: TITULO_DESCARTAR })).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Seguir editando' }));

    // Assert
    expect(screen.queryByRole('dialog', { name: TITULO_DESCARTAR })).not.toBeInTheDocument();
    expect(campo).toHaveFocus();
  });

  it('ocupado ignora el ✕, Esc, el fondo y «Cancelar» del pie, aunque haya cambios sin guardar', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    render(<Pantalla sucio ocupado onCerrar={onCerrar} />);
    await user.click(screen.getByRole('button', { name: 'Abrir panel' }));
    const panel = screen.getByRole('dialog', { name: 'Editar usuario' });

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar panel' }));
    await user.keyboard('{Escape}');
    await user.click(fondoDe(panel));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(onCerrar).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Editar usuario' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: TITULO_DESCARTAR })).not.toBeInTheDocument();
  });

  it('con el diálogo de descartar encima, Esc y su fondo cierran solo el diálogo y el foco vuelve al campo del panel', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    render(<Pantalla sucio onCerrar={onCerrar} />);
    await user.click(screen.getByRole('button', { name: 'Abrir panel' }));
    const campo = screen.getByRole('textbox', { name: 'Nombre completo' });

    // Act
    await user.keyboard('{Escape}');

    // Assert
    expect(screen.getByRole('dialog', { name: TITULO_DESCARTAR })).toBeInTheDocument();

    // Act
    await user.keyboard('{Escape}');

    // Assert
    expect(screen.queryByRole('dialog', { name: TITULO_DESCARTAR })).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Editar usuario' })).toBeInTheDocument();
    expect(onCerrar).not.toHaveBeenCalled();
    expect(campo).toHaveFocus();

    // Act
    await user.keyboard('{Escape}');
    await user.click(fondoDe(screen.getByRole('dialog', { name: TITULO_DESCARTAR })));

    // Assert
    expect(screen.queryByRole('dialog', { name: TITULO_DESCARTAR })).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Editar usuario' })).toBeInTheDocument();
    expect(onCerrar).not.toHaveBeenCalled();
    expect(campo).toHaveFocus();
  });

  it('bloquea el scroll del fondo mientras está abierto y restaura el valor anterior al cerrar', async () => {
    // Arrange
    const user = userEvent.setup();
    onTestFinished(() => {
      document.body.style.overflow = '';
    });
    document.body.style.overflow = 'scroll';
    render(<Pantalla />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Abrir panel' }));

    // Assert
    // El bloqueo es un efecto sobre document.body, no una clase: se observa en su propio estilo.
    expect(document.body.style.overflow).toBe('hidden');

    // Act
    await user.keyboard('{Escape}');

    // Assert
    expect(document.body.style.overflow).toBe('scroll');
  });

  it('con dos paneles montados, cerrar uno no libera el scroll y cerrar el último lo restaura', async () => {
    // Arrange
    const user = userEvent.setup();
    onTestFinished(() => {
      document.body.style.overflow = '';
    });
    document.body.style.overflow = 'scroll';
    function DosPaneles() {
      const [segundo, setSegundo] = useState(true);
      const [primero, setPrimero] = useState(true);
      return (
        <>
          {primero && (
            <SidePanel titulo="Primero" onCerrar={() => setPrimero(false)}>
              <input aria-label="Campo uno" />
            </SidePanel>
          )}
          {segundo && (
            <SidePanel titulo="Segundo" onCerrar={() => setSegundo(false)}>
              <input aria-label="Campo dos" />
            </SidePanel>
          )}
        </>
      );
    }
    render(<DosPaneles />);

    // Assert
    expect(document.body.style.overflow).toBe('hidden');

    // Act
    await user.keyboard('{Escape}');

    // Assert
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(document.body.style.overflow).toBe('hidden');

    // Act
    await user.keyboard('{Escape}');

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('scroll');
  });
});
