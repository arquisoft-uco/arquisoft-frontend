import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { errorApi } from '../../../../test-utils/errores-api';
import { toast } from '../../../../shared/hooks/useToast';
import { useCerrarObservacionItem } from '../../hooks/useCerrarObservacionItem';
import CerrarObservacionItemDialog from './CerrarObservacionItemDialog';

vi.mock('../../hooks/useCerrarObservacionItem', () => ({
  useCerrarObservacionItem: vi.fn(),
}));

vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

type Opciones = { onSuccess?: () => void; onError?: (err: unknown) => void };

function conMutacion(mutate = vi.fn()) {
  const resultado: Partial<Record<keyof ReturnType<typeof useCerrarObservacionItem>, unknown>> = {
    mutate,
    isPending: false,
  };
  vi.mocked(useCerrarObservacionItem).mockReturnValue(
    resultado as ReturnType<typeof useCerrarObservacionItem>,
  );
  return mutate;
}

function montar() {
  const onCerrar = vi.fn();
  render(
    <CerrarObservacionItemDialog observacionId="o-1" fichaPerfilId="f-1" onCerrar={onCerrar} />,
  );
  return onCerrar;
}

describe('CerrarObservacionItemDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('al confirmar cierra la observación, avisa del éxito y se cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = conMutacion(vi.fn((_id: string, opts: Opciones) => opts.onSuccess?.()));
    const onCerrar = montar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar observación' }));

    // Assert
    expect(useCerrarObservacionItem).toHaveBeenCalledWith('f-1');
    expect(mutate.mock.calls[0][0]).toBe('o-1');
    expect(toast.success).toHaveBeenCalledWith('Observación cerrada');
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('ante un 422 avisa con el motivo del código y se cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    conMutacion(
      vi.fn((_id: string, opts: Opciones) =>
        opts.onError?.(
          errorApi(422, {
            errorCode: 'REVISION_ITEM_NO_CORRECCION_DISPONIBLE',
            message: 'backend',
          }),
        ),
      ),
    );
    const onCerrar = montar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar observación' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo cerrar la observación',
      'El estudiante aún no ha enviado las correcciones de esta revisión.',
    );
    expect(toast.success).not.toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('cancelar no llama a la mutación', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = conMutacion();
    const onCerrar = montar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(mutate).not.toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});
