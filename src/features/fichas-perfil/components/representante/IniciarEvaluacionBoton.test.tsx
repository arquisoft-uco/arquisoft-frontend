import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import { toast } from '../../../../shared/hooks/useToast';
import { useRegistrarEvaluacion } from '../../hooks/useRegistrarEvaluacion';
import IniciarEvaluacionBoton from './IniciarEvaluacionBoton';

vi.mock('../../hooks/useRegistrarEvaluacion', () => ({ useRegistrarEvaluacion: vi.fn() }));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

type Opciones = { onSuccess?: () => void; onError?: (err: Error) => void };

function mockMutacion(mutate: (vars: unknown, opciones?: Opciones) => void) {
  vi.mocked(useRegistrarEvaluacion).mockReturnValue({ mutate, isPending: false } as never);
}

async function abrirYConfirmar(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Iniciar evaluación' }));
  await user.click(
    within(screen.getByRole('dialog')).getByRole('button', { name: 'Iniciar evaluación' }),
  );
}

describe('IniciarEvaluacionBoton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('pide confirmación y cancelar cierra el diálogo sin registrar', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = vi.fn();
    mockMutacion(mutate);
    render(<IniciarEvaluacionBoton fichaPerfilId="f-1" />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Iniciar evaluación' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(useRegistrarEvaluacion).toHaveBeenCalledWith('f-1');
    expect(mutate).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('al confirmar registra, avisa del éxito y cierra el diálogo', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = vi.fn((_v: unknown, o?: Opciones) => o?.onSuccess?.());
    mockMutacion(mutate);
    render(<IniciarEvaluacionBoton fichaPerfilId="f-1" />);

    // Act
    await abrirYConfirmar(user);

    // Assert
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith(
      'Evaluación iniciada',
      'Se registró la evaluación de la ficha.',
    );
    expect(toast.error).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('si el registro falla avisa con un toast de error y cierra el diálogo', async () => {
    // Arrange
    const user = userEvent.setup();
    mockMutacion(vi.fn((_v: unknown, o?: Opciones) => o?.onError?.(new Error('Red caída'))));
    render(<IniciarEvaluacionBoton fichaPerfilId="f-1" />);

    // Act
    await abrirYConfirmar(user);

    // Assert
    expect(toast.error).toHaveBeenCalledWith('Error al iniciar la evaluación', expect.any(String));
    expect(toast.success).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
