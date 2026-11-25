import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import { toast } from '../../../../shared/hooks/useToast';
import { useDescartarEvaluacion } from '../../hooks/useDescartarEvaluacion';
import DescartarEvaluacionBoton from './DescartarEvaluacionBoton';

vi.mock('../../hooks/useDescartarEvaluacion', () => ({ useDescartarEvaluacion: vi.fn() }));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

type Opciones = { onSuccess?: () => void; onError?: (err: unknown) => void };

function mockMutacion(mutate: (vars: unknown, opciones?: Opciones) => void) {
  vi.mocked(useDescartarEvaluacion).mockReturnValue({ mutate, isPending: false } as never);
}

async function abrirYConfirmar(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Descartar evaluación' }));
  await user.click(
    within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Descartar evaluación' }),
  );
}

describe('DescartarEvaluacionBoton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('pide confirmación con las consecuencias y cancelar cierra sin descartar', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = vi.fn();
    mockMutacion(mutate);
    render(<DescartarEvaluacionBoton fichaPerfilId="f-1" evaluacionId="ev-1" />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Descartar evaluación' }));

    // Assert
    const dialogo = screen.getByRole('alertdialog');
    expect(useDescartarEvaluacion).toHaveBeenCalledWith('f-1');
    expect(within(dialogo).getByText('Tus observaciones se conservan.')).toBeInTheDocument();

    // Act
    await user.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(mutate).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('al confirmar descarta la evaluación, avisa del éxito y cierra el diálogo', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = vi.fn((_v: unknown, o?: Opciones) => o?.onSuccess?.());
    mockMutacion(mutate);
    render(<DescartarEvaluacionBoton fichaPerfilId="f-1" evaluacionId="ev-1" />);

    // Act
    await abrirYConfirmar(user);

    // Assert
    expect(mutate).toHaveBeenCalledWith('ev-1', expect.any(Object));
    expect(toast.success).toHaveBeenCalledWith('Evaluación descartada', expect.any(String));
    expect(toast.error).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('si el descarte falla avisa con un toast de error y cierra el diálogo', async () => {
    // Arrange
    const user = userEvent.setup();
    mockMutacion(vi.fn((_v: unknown, o?: Opciones) => o?.onError?.(new Error('Red caída'))));
    render(<DescartarEvaluacionBoton fichaPerfilId="f-1" evaluacionId="ev-1" />);

    // Act
    await abrirYConfirmar(user);

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'Error al descartar la evaluación',
      expect.any(String),
    );
    expect(toast.success).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});
