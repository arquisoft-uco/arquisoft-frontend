import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import { toast } from '../../../../shared/hooks/useToast';
import type { ApiError } from '../../../../shared/models/api-response';
import { RESPUESTA } from '../../../../test-utils/respuestas';
import { useModificarEstadoRespuestaNovedadCoordinador } from '../../hooks/useModificarEstadoRespuestaNovedadCoordinador';
import ModificarEstadoRespuestaDialog from './ModificarEstadoRespuestaDialog';

vi.mock('../../hooks/useModificarEstadoRespuestaNovedadCoordinador', () => ({
  useModificarEstadoRespuestaNovedadCoordinador: vi.fn(),
}));

vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

type Hook = ReturnType<typeof useModificarEstadoRespuestaNovedadCoordinador>;
type OpcionesMutate = { onSuccess?: () => void; onError?: (err: unknown) => void };

function mockearHook(mutate = vi.fn(), isPending = false) {
  vi.mocked(useModificarEstadoRespuestaNovedadCoordinador).mockReturnValue({
    data: undefined,
    error: null,
    variables: undefined,
    context: undefined,
    failureCount: 0,
    failureReason: null,
    isPaused: false,
    submittedAt: 0,
    status: 'idle',
    isError: false,
    isIdle: true,
    isPending: false,
    isSuccess: false,
    mutate,
    mutateAsync: vi.fn(),
    reset: vi.fn(),
    ...(isPending ? { isPending: true } : {}),
  } as Hook);
  return mutate;
}

function crearErrorApi(cuerpo: ApiError) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: cuerpo,
    status: cuerpo.status,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('ModificarEstadoRespuestaDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el título, el estudiante y las consecuencias de cada decisión', () => {
    // Arrange
    mockearHook();

    // Act
    const { unmount } = render(
      <ModificarEstadoRespuestaDialog
        respuesta={RESPUESTA}
        nuevoEstado="APROBADA"
        onCerrar={vi.fn()}
      />,
    );

    // Assert
    const aprobar = screen.getByRole('dialog');
    expect(aprobar).toHaveTextContent('¿Aprobar respuesta?');
    expect(aprobar).toHaveTextContent('Vas a aprobar tu respuesta a Luis Gómez.');
    expect(aprobar).toHaveTextContent('No podrás cambiar el estado ni eliminar la respuesta');
    unmount();

    // Act
    render(
      <ModificarEstadoRespuestaDialog
        respuesta={RESPUESTA}
        nuevoEstado="NO_APROBADA"
        onCerrar={vi.fn()}
      />,
    );

    // Assert
    const noAprobar = screen.getByRole('dialog');
    expect(noAprobar).toHaveTextContent('¿Marcar como no aprobada?');
    expect(noAprobar).toHaveTextContent('El estudiante recibirá un aviso por correo.');
  });

  it('al confirmar envía el id de la solicitud, lanza el toast de éxito y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const mutate = mockearHook(
      vi.fn((_req: unknown, opciones?: OpcionesMutate) => opciones?.onSuccess?.()),
    );
    render(
      <ModificarEstadoRespuestaDialog
        respuesta={RESPUESTA}
        nuevoEstado="APROBADA"
        onCerrar={onCerrar}
      />,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Aprobar' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { solicitudId: RESPUESTA.solicitud.id, nuevoEstado: 'APROBADA' },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith('Respuesta aprobada', expect.any(String));
    expect(toast.error).not.toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('en error lanza toast.error con el mensaje del backend y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mockearHook(
      vi.fn((_req: unknown, opciones?: OpcionesMutate) =>
        opciones?.onError?.(
          crearErrorApi({
            error: 'Unprocessable Entity',
            errorCode: 'RESPUESTA_NO_EN_REVISION',
            message: 'La respuesta ya fue evaluada.',
            status: 422,
          }),
        ),
      ),
    );
    render(
      <ModificarEstadoRespuestaDialog
        respuesta={RESPUESTA}
        nuevoEstado="NO_APROBADA"
        onCerrar={onCerrar}
      />,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Marcar como no aprobada' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo cambiar el estado de la respuesta',
      'La respuesta ya fue evaluada.',
    );
    expect(toast.success).not.toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('cancelar cierra sin enviar nada', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const mutate = mockearHook();
    render(
      <ModificarEstadoRespuestaDialog
        respuesta={RESPUESTA}
        nuevoEstado="APROBADA"
        onCerrar={onCerrar}
      />,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('con la mutación en curso ignora la cancelación', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mockearHook(vi.fn(), true);
    render(
      <ModificarEstadoRespuestaDialog
        respuesta={RESPUESTA}
        nuevoEstado="APROBADA"
        onCerrar={onCerrar}
      />,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(onCerrar).not.toHaveBeenCalled();
  });
});
