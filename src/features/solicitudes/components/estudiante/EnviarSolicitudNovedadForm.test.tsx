import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen, waitFor } from '../../../../test-utils/render';
import EnviarSolicitudNovedadForm from './EnviarSolicitudNovedadForm';
import { useEnviarSolicitudNovedadCoordinador } from '../../hooks/useEnviarSolicitudNovedadCoordinador';
import { toast } from '../../../../shared/hooks/useToast';
import type { ApiError } from '../../../../shared/models/api-response';

vi.mock('../../hooks/useEnviarSolicitudNovedadCoordinador', () => ({
  useEnviarSolicitudNovedadCoordinador: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const useEnviarSolicitudNovedadCoordinadorMock = vi.mocked(useEnviarSolicitudNovedadCoordinador);

const UUID_VALIDO = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
const MENSAJE_VALIDO = 'No he podido contactar a mi asesor.';

function crearErrorApi(cuerpo: ApiError) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: cuerpo,
    status: cuerpo.status,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

type MutateOptions = {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
};

type MutacionEnviarSolicitud = ReturnType<typeof useEnviarSolicitudNovedadCoordinador>;

function crearMutacionMock(
  mutate: ReturnType<typeof vi.fn>,
  isPending = false,
): MutacionEnviarSolicitud {
  return {
    data: undefined,
    error: null,
    variables: undefined,
    context: undefined,
    failureCount: 0,
    failureReason: null,
    isPaused: false,
    submittedAt: 0,
    status: isPending ? 'pending' : 'idle',
    isError: false,
    isIdle: !isPending,
    isPending,
    isSuccess: false,
    mutate,
    mutateAsync: vi.fn(),
    reset: vi.fn(),
  } as MutacionEnviarSolicitud;
}

function mockMutacion(mutate = vi.fn(), isPending = false) {
  useEnviarSolicitudNovedadCoordinadorMock.mockReturnValue(crearMutacionMock(mutate, isPending));
  return mutate;
}

async function llenarFormularioValido(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Destinatario/), UUID_VALIDO);
  await user.type(screen.getByLabelText(/^Mensaje/), MENSAJE_VALIDO);
}

describe('EnviarSolicitudNovedadForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mantiene Enviar solicitud deshabilitado hasta que los campos son válidos y muestra el aviso de catálogo no disponible', async () => {
    mockMutacion();
    const user = userEvent.setup();
    render(<EnviarSolicitudNovedadForm />);
    const submit = screen.getByRole('button', { name: 'Enviar solicitud' });

    await waitFor(() => expect(submit).toBeDisabled());
    expect(screen.getByRole('alert')).toHaveTextContent(/catálogo de coordinadores/i);

    await llenarFormularioValido(user);

    await waitFor(() => expect(submit).toBeEnabled());
  });

  it('bloquea el envío cuando el destinatario no tiene formato UUID', async () => {
    mockMutacion();
    const user = userEvent.setup();
    render(<EnviarSolicitudNovedadForm />);

    await user.type(screen.getByLabelText(/Destinatario/), 'no-es-un-uuid');
    await user.type(screen.getByLabelText(/^Mensaje/), MENSAJE_VALIDO);

    expect(await screen.findByText('Identificador inválido')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar solicitud' })).toBeDisabled();
  });

  it('abre el diálogo de confirmación al enviar y lo cierra sin llamar a mutate al cancelar', async () => {
    const mutate = mockMutacion();
    const user = userEvent.setup();
    render(<EnviarSolicitudNovedadForm />);

    await llenarFormularioValido(user);
    await user.click(await screen.findByRole('button', { name: 'Enviar solicitud' }));

    const dialogo = screen.getByRole('dialog');
    expect(dialogo).toHaveTextContent('Enviar solicitud al coordinador');
    expect(mutate).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('al confirmar con datos válidos, envía la solicitud, notifica el éxito y limpia el formulario', async () => {
    const mutate = vi.fn((_req: unknown, opciones?: MutateOptions) => opciones?.onSuccess?.());
    mockMutacion(mutate);
    const user = userEvent.setup();
    render(<EnviarSolicitudNovedadForm />);

    await llenarFormularioValido(user);
    await user.click(await screen.findByRole('button', { name: 'Enviar solicitud' }));
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(mutate).toHaveBeenCalledWith(
      { destinatario: UUID_VALIDO, mensajeSolicitud: MENSAJE_VALIDO },
      expect.anything(),
    );
    expect(toast.success).toHaveBeenCalledWith('Solicitud enviada', expect.any(String));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Destinatario/)).toHaveValue('');
  });

  it('pinta el error en el campo destinatario y notifica cuando el backend responde DESTINATARIO_NO_ENCONTRADO', async () => {
    const mutate = vi.fn((_req: unknown, opciones?: MutateOptions) =>
      opciones?.onError?.(
        crearErrorApi({
          error: 'Unprocessable Entity',
          errorCode: 'DESTINATARIO_NO_ENCONTRADO',
          message: 'El coordinador indicado no existe.',
          status: 422,
        }),
      ),
    );
    mockMutacion(mutate);
    const user = userEvent.setup();
    render(<EnviarSolicitudNovedadForm />);

    await llenarFormularioValido(user);
    await user.click(await screen.findByRole('button', { name: 'Enviar solicitud' }));
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(await screen.findByText('El coordinador indicado no existe.')).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo enviar la solicitud',
      'El coordinador indicado no existe.',
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('notifica con toast sin marcar ningún campo cuando el backend responde SOLICITUD_DUPLICADA', async () => {
    const mutate = vi.fn((_req: unknown, opciones?: MutateOptions) =>
      opciones?.onError?.(
        crearErrorApi({
          error: 'Unprocessable Entity',
          errorCode: 'SOLICITUD_DUPLICADA',
          message: 'Ya enviaste esta misma solicitud hoy.',
          status: 422,
        }),
      ),
    );
    mockMutacion(mutate);
    const user = userEvent.setup();
    render(<EnviarSolicitudNovedadForm />);

    await llenarFormularioValido(user);
    await user.click(await screen.findByRole('button', { name: 'Enviar solicitud' }));
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'No se pudo enviar la solicitud',
        'Ya enviaste esta misma solicitud hoy.',
      ),
    );
    expect(screen.queryByText('Ya enviaste esta misma solicitud hoy.')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Destinatario/)).toHaveValue(UUID_VALIDO);
  });
});
