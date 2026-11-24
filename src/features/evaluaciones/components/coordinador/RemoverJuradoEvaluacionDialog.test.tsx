import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import RemoverJuradoEvaluacionDialog from './RemoverJuradoEvaluacionDialog';
import { useRemoverJuradoEvaluacion } from '../../hooks/useRemoverJuradoEvaluacion';
import { toast } from '../../../../shared/hooks/useToast';
import type { EvaluacionJurado } from '../../models/EvaluacionJurado';

vi.mock('../../hooks/useRemoverJuradoEvaluacion', () => ({
  useRemoverJuradoEvaluacion: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const JURADO: EvaluacionJurado = {
  id: 'ej-1',
  jurado: { id: 'j-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
  notas: { resumenCualitativo: null, resumenCuantitativo: null, notaAcumulada: null },
};

type MutateOptions = {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
};

function errorApi(errorCode: string) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Error', errorCode, message: 'x', status: 422 },
    status: 422,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

function mockMutacion(mutate = vi.fn()) {
  vi.mocked(useRemoverJuradoEvaluacion).mockReturnValue({
    isPending: false,
    mutate,
  } as Partial<ReturnType<typeof useRemoverJuradoEvaluacion>> as ReturnType<
    typeof useRemoverJuradoEvaluacion
  >);
  return mutate;
}

function montar(parcial: { retrocederPagina?: boolean } = {}) {
  const onRetroceder = vi.fn();
  const onCerrar = vi.fn();
  render(
    <RemoverJuradoEvaluacionDialog
      evaluacionId="e-1"
      jurado={JURADO}
      retrocederPagina={parcial.retrocederPagina ?? false}
      onRetroceder={onRetroceder}
      onCerrar={onCerrar}
    />,
  );
  return { onRetroceder, onCerrar };
}

describe('RemoverJuradoEvaluacionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('nombra al jurado y, al confirmar, envía el id del usuario jurado, avisa y cierra', async () => {
    // Arrange
    const mutate = mockMutacion(
      vi.fn((_id: string, opciones?: MutateOptions) => opciones?.onSuccess?.()),
    );
    const { onCerrar, onRetroceder } = montar();
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Ana Pérez');

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Remover' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith('j-1', expect.any(Object));
    expect(toast.success).toHaveBeenCalledWith(
      'Jurado removido',
      expect.stringContaining('Ana Pérez'),
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(onRetroceder).not.toHaveBeenCalled();
  });

  it('con retrocederPagina llama a onRetroceder tras remover', async () => {
    // Arrange
    mockMutacion(vi.fn((_id: string, opciones?: MutateOptions) => opciones?.onSuccess?.()));
    const { onRetroceder, onCerrar } = montar({ retrocederPagina: true });

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Remover' }));

    // Assert
    expect(onRetroceder).toHaveBeenCalledTimes(1);
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('ante el 422 de jurado con evaluaciones avisa con su nombre y cierra', async () => {
    // Arrange
    mockMutacion(
      vi.fn((_id: string, opciones?: MutateOptions) =>
        opciones?.onError?.(errorApi('EVALUACION_JURADO_JURADOS_EVALUADOS')),
      ),
    );
    const { onCerrar, onRetroceder } = montar({ retrocederPagina: true });

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Remover' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo remover el jurado',
      'No se puede remover a Ana Pérez porque ya completó su evaluación y no puede retirarse.',
    );
    expect(toast.success).not.toHaveBeenCalled();
    expect(onRetroceder).not.toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('al cancelar cierra sin enviar ni notificar', async () => {
    // Arrange
    const mutate = mockMutacion();
    const { onCerrar } = montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(mutate).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});
