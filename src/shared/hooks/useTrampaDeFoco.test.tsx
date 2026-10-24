import { StrictMode, createRef, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { act, render, screen } from '../../test-utils/render';
import { useTrampaDeFoco } from './useTrampaDeFoco';

interface PropsCapa {
  nombre?: string;
  focoInicial?: RefObject<HTMLElement | null>;
  retorno?: RefObject<HTMLElement | null>;
  alEscape?: () => void;
  esModal?: () => boolean;
  children: ReactNode;
}

type PropsAbrible = Omit<PropsCapa, 'nombre' | 'alEscape'> & { fuera?: ReactNode };

function Capa({ nombre = 'Capa', children, ...opciones }: PropsCapa) {
  const contenedor = useRef<HTMLDivElement>(null);
  useTrampaDeFoco({ contenedor, ...opciones });

  return (
    <div ref={contenedor} role="dialog" aria-label={nombre} tabIndex={-1}>
      {children}
    </div>
  );
}

function Abrible({ fuera, children, ...opciones }: PropsAbrible) {
  const [abierta, setAbierta] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setAbierta(true)}>
        Abrir
      </button>
      {fuera}
      {abierta && (
        <Capa alEscape={() => setAbierta(false)} {...opciones}>
          {children}
        </Capa>
      )}
    </>
  );
}

function PanelConDialogo({
  alEscapePanel,
  alEscapeDialogo,
}: {
  alEscapePanel: () => void;
  alEscapeDialogo: () => void;
}) {
  const [dialogo, setDialogo] = useState(false);

  function cerrarDialogo() {
    alEscapeDialogo();
    setDialogo(false);
  }

  return (
    <>
      <Capa nombre="Panel" alEscape={alEscapePanel}>
        <button type="button">Campo del panel</button>
        <button type="button" onClick={() => setDialogo(true)}>
          Abrir diálogo
        </button>
      </Capa>
      {dialogo && (
        <Capa nombre="Diálogo" alEscape={cerrarDialogo}>
          <button type="button">Cancelar</button>
          <button type="button">Confirmar</button>
        </Capa>
      )}
    </>
  );
}

describe('useTrampaDeFoco', () => {
  it('al montar enfoca el primer control visible o, con focoInicial, el control indicado o el primero visible de su contenedor', () => {
    // Arrange
    const medio = createRef<HTMLButtonElement>();
    const cuerpo = createRef<HTMLDivElement>();

    // Act
    const sinIndicar = render(
      <Capa>
        <div hidden>
          <button type="button">Oculto</button>
        </div>
        <button type="button">Primero</button>
        <button type="button">Medio</button>
      </Capa>,
    );

    // Assert
    expect(screen.getByRole('button', { name: 'Primero' })).toHaveFocus();

    // Act
    sinIndicar.unmount();
    const indicandoUnControl = render(
      <Capa focoInicial={medio}>
        <button type="button">Primero</button>
        <button type="button" ref={medio}>
          Medio
        </button>
      </Capa>,
    );

    // Assert
    expect(screen.getByRole('button', { name: 'Medio' })).toHaveFocus();

    // Act
    indicandoUnControl.unmount();
    render(
      <Capa focoInicial={cuerpo}>
        <button type="button">Cerrar panel</button>
        <div ref={cuerpo}>
          <div hidden>
            <button type="button">Oculto</button>
          </div>
          <input aria-label="Campo" />
        </div>
      </Capa>,
    );

    // Assert
    expect(screen.getByRole('textbox', { name: 'Campo' })).toHaveFocus();
  });

  it('Tab desde el último control vuelve al primero y Mayús+Tab desde el primero va al último, sin contar los ocultos', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Antes</button>
        <Capa>
          <button type="button">Primero</button>
          <button type="button">Último</button>
          <div hidden>
            <button type="button">Oculto</button>
          </div>
        </Capa>
        <button type="button">Después</button>
      </>,
    );

    // Act
    await user.tab({ shift: true });

    // Assert
    expect(screen.getByRole('button', { name: 'Último' })).toHaveFocus();

    // Act
    await user.tab();

    // Assert
    expect(screen.getByRole('button', { name: 'Primero' })).toHaveFocus();
  });

  it('con esModal falso Tab sale de la capa y Esc sigue llamando a alEscape, salvo que un control interno ya lo haya manejado', async () => {
    // Arrange
    const user = userEvent.setup();
    const alEscape = vi.fn();
    render(
      <>
        <Capa alEscape={alEscape} esModal={() => false}>
          <button type="button">Primero</button>
          <button
            type="button"
            onKeyDown={(evento) => {
              if (evento.key === 'Escape') evento.preventDefault();
            }}
          >
            Menú
          </button>
        </Capa>
        <button type="button">Después</button>
      </>,
    );

    // Act
    await user.tab();
    await user.keyboard('{Escape}');

    // Assert
    expect(screen.getByRole('button', { name: 'Menú' })).toHaveFocus();
    expect(alEscape).not.toHaveBeenCalled();

    // Act
    await user.tab();

    // Assert
    expect(screen.getByRole('button', { name: 'Después' })).toHaveFocus();

    // Act
    await user.keyboard('{Escape}');

    // Assert
    expect(alEscape).toHaveBeenCalledTimes(1);
  });

  it('al desmontar devuelve el foco al disparador o a retorno, pero no se lo quita a quien ya lo movió a otro control', async () => {
    // Arrange
    const user = userEvent.setup();
    const destino = createRef<HTMLButtonElement>();

    // Act
    const alDisparador = render(
      <Abrible>
        <button type="button">Dentro</button>
      </Abrible>,
    );
    await user.click(screen.getByRole('button', { name: 'Abrir' }));
    await user.keyboard('{Escape}');

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abrir' })).toHaveFocus();

    // Act
    alDisparador.unmount();
    const aRetorno = render(
      <Abrible
        retorno={destino}
        fuera={
          <button type="button" ref={destino}>
            Destino
          </button>
        }
      >
        <button type="button">Dentro</button>
      </Abrible>,
    );
    await user.click(screen.getByRole('button', { name: 'Abrir' }));
    await user.keyboard('{Escape}');

    // Assert
    expect(screen.getByRole('button', { name: 'Destino' })).toHaveFocus();

    // Act
    aRetorno.unmount();
    render(
      <Abrible esModal={() => false} fuera={<button type="button">Otro</button>}>
        <button type="button">Dentro</button>
      </Abrible>,
    );
    await user.click(screen.getByRole('button', { name: 'Abrir' }));
    await user.click(screen.getByRole('button', { name: 'Otro' }));

    // Assert
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Otro' })).toHaveFocus();

    // Act
    await user.keyboard('{Escape}');

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Otro' })).toHaveFocus();
  });

  it('con una capa sobre otra solo la de arriba atiende Esc y Tab, y al cerrarla el foco vuelve al control de la de abajo', async () => {
    // Arrange
    const user = userEvent.setup();
    const alEscapePanel = vi.fn();
    const alEscapeDialogo = vi.fn();
    render(<PanelConDialogo alEscapePanel={alEscapePanel} alEscapeDialogo={alEscapeDialogo} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Abrir diálogo' }));

    // Assert
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus();

    // Act
    await user.tab();
    await user.tab();

    // Assert
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus();

    // Act
    await user.keyboard('{Escape}');

    // Assert
    expect(alEscapeDialogo).toHaveBeenCalledTimes(1);
    expect(alEscapePanel).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog', { name: 'Diálogo' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abrir diálogo' })).toHaveFocus();

    // Act
    await user.keyboard('{Escape}');

    // Assert
    expect(alEscapePanel).toHaveBeenCalledTimes(1);
    expect(alEscapeDialogo).toHaveBeenCalledTimes(1);
  });

  it('devuelve al último control de la capa de arriba el foco que cae fuera, ya sea por un clic o por foco programático', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <>
        <Capa>
          <button type="button">Primero</button>
          <button type="button">Segundo</button>
        </Capa>
        <button type="button">Fuera</button>
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Segundo' }));

    // Act
    await user.click(screen.getByRole('button', { name: 'Fuera' }));

    // Assert
    expect(screen.getByRole('button', { name: 'Segundo' })).toHaveFocus();

    // Act
    act(() => screen.getByRole('button', { name: 'Fuera' }).focus());

    // Assert
    expect(screen.getByRole('button', { name: 'Segundo' })).toHaveFocus();
  });

  it('bajo StrictMode el primer control conserva el foco al abrir y el disparador se recuerda para el cierre real', async () => {
    // Arrange
    const user = userEvent.setup();
    const alPerderFoco = vi.fn();
    render(
      <StrictMode>
        <Abrible>
          <button type="button" onBlur={alPerderFoco}>
            Primero
          </button>
          <button type="button">Segundo</button>
        </Abrible>
      </StrictMode>,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Abrir' }));

    // Assert
    expect(screen.getByRole('button', { name: 'Primero' })).toHaveFocus();
    expect(alPerderFoco).not.toHaveBeenCalled();

    // Act
    await user.keyboard('{Escape}');

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abrir' })).toHaveFocus();
  });
});
