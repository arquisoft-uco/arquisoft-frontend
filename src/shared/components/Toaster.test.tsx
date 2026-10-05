import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act, render, screen, within } from '../../test-utils/render';
import {
  avanzar,
  restaurarTemporizadores,
  usarTemporizadoresFalsos,
} from '../../test-utils/temporizadores';
import { toast } from '../hooks/useToast';
import { useToastStore } from '../stores/toastStore';
import Toaster from './Toaster';

describe('Toaster', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  afterEach(() => {
    restaurarTemporizadores();
  });

  it('expone la región de notificaciones con su nombre accesible', () => {
    // Act
    render(<Toaster />);

    // Assert
    expect(screen.getByRole('region', { name: 'Notificaciones' })).toBeInTheDocument();
  });

  it('el error se anuncia como alerta y el éxito y la información como estado', () => {
    // Arrange
    render(<Toaster />);

    // Act
    act(() => {
      toast.error('No se pudo guardar', 'Inténtalo nuevamente.');
      toast.success('Cambios guardados');
      toast.info('Tu sesión vence pronto');
    });

    // Assert
    const alerta = screen.getByRole('alert');
    expect(alerta).toHaveTextContent('No se pudo guardar');
    expect(alerta).toHaveTextContent('Inténtalo nuevamente.');
    const estados = screen.getAllByRole('status');
    expect(estados).toHaveLength(2);
    expect(estados[0]).toHaveTextContent('Cambios guardados');
    expect(estados[1]).toHaveTextContent('Tu sesión vence pronto');
  });

  it('el temporizador se detiene con el cursor o el foco encima y se reanuda con el tiempo restante', async () => {
    // Arrange
    const user = usarTemporizadoresFalsos();
    render(<Toaster />);
    act(() => {
      toast.success('Cambios guardados');
    });
    const aviso = screen.getByRole('status');

    // Act
    avanzar(3000);
    await user.hover(aviso);
    avanzar(10_000);

    // Assert
    expect(aviso).toBeInTheDocument();

    // Act
    await user.unhover(aviso);
    avanzar(999);

    // Assert
    expect(aviso).toBeInTheDocument();

    // Act
    // El primer avance cumple el plazo; el segundo, la salida animada que ese plazo programa.
    avanzar(1);
    avanzar(1000);

    // Assert
    expect(aviso).not.toBeInTheDocument();

    // Act
    act(() => {
      toast.info('Tu sesión vence pronto');
    });
    await user.tab();
    avanzar(10_000);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();

    // Act
    await user.tab();
    avanzar(3999);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();

    // Act
    avanzar(1);
    avanzar(1000);

    // Assert
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('solo se ven los tres últimos avisos y el más antiguo no vuelve cuando se cierra otro', async () => {
    // Arrange
    const user = usarTemporizadoresFalsos();
    render(<Toaster />);

    // Act
    act(() => {
      toast.info('Aviso 1');
      toast.info('Aviso 2');
      toast.info('Aviso 3');
      toast.info('Aviso 4');
    });

    // Assert
    expect(screen.getAllByRole('status').map((aviso) => aviso.textContent)).toEqual([
      'Aviso 2',
      'Aviso 3',
      'Aviso 4',
    ]);

    // Act
    await user.click(
      within(screen.getAllByRole('status')[1]).getByRole('button', {
        name: 'Cerrar notificación',
      }),
    );
    avanzar(1000);

    // Assert
    expect(screen.getAllByRole('status').map((aviso) => aviso.textContent)).toEqual([
      'Aviso 2',
      'Aviso 4',
    ]);
    expect(screen.queryByText('Aviso 1')).not.toBeInTheDocument();
  });

  it('el botón «Cerrar notificación» quita el aviso sin esperar su duración', async () => {
    // Arrange
    const user = usarTemporizadoresFalsos();
    render(<Toaster />);
    act(() => {
      toast.error('No se pudo guardar', 'Inténtalo nuevamente.');
    });

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar notificación' }));
    avanzar(1000);

    // Assert
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
