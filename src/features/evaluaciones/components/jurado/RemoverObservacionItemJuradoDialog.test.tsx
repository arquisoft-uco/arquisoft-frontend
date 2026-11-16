import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import RemoverObservacionItemJuradoDialog from './RemoverObservacionItemJuradoDialog';
import { useRemoverObservacionItemJurado } from '../../hooks/useRemoverObservacionItemJurado';
import { toast } from '../../../../shared/hooks/useToast';
import type { ObservacionItemJurado } from '../../models/ObservacionItemJurado';

vi.mock('../../hooks/useRemoverObservacionItemJurado', () => ({
  useRemoverObservacionItemJurado: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const OBSERVACION: ObservacionItemJurado = { id: 'obs-1', descripcion: 'Falta rigor' };

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
  vi.mocked(useRemoverObservacionItemJurado).mockReturnValue({
    isPending: false,
    mutate,
  } as Partial<ReturnType<typeof useRemoverObservacionItemJurado>> as ReturnType<
    typeof useRemoverObservacionItemJurado
  >);
  return mutate;
}

function montar() {
  const onRemovida = vi.fn();
  const onCerrar = vi.fn();
  render(
    <RemoverObservacionItemJuradoDialog
      observacion={OBSERVACION}
      nombreItem="Claridad"
      onRemovida={onRemovida}
      onCerrar={onCerrar}
    />,
  );
  return { onRemovida, onCerrar };
}

describe('RemoverObservacionItemJuradoDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('nombra el ítem y, al confirmar, envía el id, avisa el éxito y cierra', async () => {
    // Arrange
    const mutate = mockMutacion(
      vi.fn((_id: string, opciones?: MutateOptions) => opciones?.onSuccess?.()),
    );
    const { onRemovida, onCerrar } = montar();
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Claridad');

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Remover observación' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith('obs-1', expect.any(Object));
    expect(toast.success).toHaveBeenCalledWith(
      'Observación removida',
      'La observación se removió correctamente.',
    );
    expect(onRemovida).toHaveBeenCalledTimes(1);
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('ante un error muestra el mensaje del código, cierra y no avisa la remoción', async () => {
    // Arrange
    mockMutacion(
      vi.fn((_id: string, opciones?: MutateOptions) =>
        opciones?.onError?.(errorApi('OBSERVACION_ITEM_JURADO_NO_ENCONTRADA')),
      ),
    );
    const { onRemovida, onCerrar } = montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Remover observación' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo remover la observación',
      'La observación ya no existe.',
    );
    expect(toast.success).not.toHaveBeenCalled();
    expect(onRemovida).not.toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('al cancelar cierra sin enviar ni notificar', async () => {
    // Arrange
    const mutate = mockMutacion();
    const { onRemovida, onCerrar } = montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(mutate).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(onRemovida).not.toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});
