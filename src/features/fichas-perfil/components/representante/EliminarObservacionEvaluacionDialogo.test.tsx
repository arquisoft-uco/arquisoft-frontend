import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import { toast } from '../../../../shared/hooks/useToast';
import { useRemoverObservacionEvaluacion } from '../../hooks/useRemoverObservacionEvaluacion';
import type { ObservacionEvaluacion } from '../../models/ObservacionEvaluacion';
import EliminarObservacionEvaluacionDialogo from './EliminarObservacionEvaluacionDialogo';

vi.mock('../../hooks/useRemoverObservacionEvaluacion', () => ({
  useRemoverObservacionEvaluacion: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const MENSAJE_NO_DISPONIBLE =
  'La ficha de perfil debe estar disponible para evaluación para realizar esta acción. Estado actual: Aprobada';

function errorFichaNoDisponible() {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: {
      error: 'Unprocessable Entity',
      errorCode: 'ESTADO_FICHA_PERFIL_NO_DISPONIBLE_PARA_EVALUACION',
      message: MENSAJE_NO_DISPONIBLE,
      status: 422,
    },
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

const OBSERVACION = { id: 'o-1', observacion: 'Ajustar el alcance' } as ObservacionEvaluacion;

function renderizar(mutate: ReturnType<typeof vi.fn>) {
  vi.mocked(useRemoverObservacionEvaluacion).mockReturnValue({
    mutate,
    isPending: false,
  } as never);
  const onCerrar = vi.fn();
  render(
    <EliminarObservacionEvaluacionDialogo
      observacion={OBSERVACION}
      fichaPerfilId="f-1"
      evaluacionId="ev-1"
      onCerrar={onCerrar}
    />,
  );
  return onCerrar;
}

describe('EliminarObservacionEvaluacionDialogo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el texto de la fila y «Cancelar» cierra sin enviar', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = vi.fn();
    const onCerrar = renderizar(mutate);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(screen.getByRole('alertdialog', { name: '¿Eliminar observación?' })).toHaveTextContent(
      'Ajustar el alcance',
    );
    expect(mutate).not.toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('al confirmar envía el id y, en éxito, lanza el toast y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = vi.fn((_id: string, opciones: { onSuccess: () => void }) =>
      opciones.onSuccess(),
    );
    const onCerrar = renderizar(mutate);

    // Act
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    // Assert
    expect(mutate.mock.calls[0][0]).toBe('o-1');
    expect(toast.success).toHaveBeenCalledWith('Observación eliminada', expect.any(String));
    expect(toast.error).not.toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('si el servidor rechaza lanza el toast de error y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = vi.fn((_id: string, opciones: { onError: (err: Error) => void }) =>
      opciones.onError(errorFichaNoDisponible()),
    );
    const onCerrar = renderizar(mutate);

    // Act
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo eliminar la observación',
      MENSAJE_NO_DISPONIBLE,
    );
    expect(toast.success).not.toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});
