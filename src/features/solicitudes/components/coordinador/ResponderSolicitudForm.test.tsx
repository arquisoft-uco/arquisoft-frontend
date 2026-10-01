import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import { toast } from '../../../../shared/hooks/useToast';
import type { ApiError } from '../../../../shared/models/api-response';
import { LIMITES } from '../../../../shared/validation';
import { useResponderSolicitudNovedadCoordinador } from '../../hooks/useResponderSolicitudNovedadCoordinador';
import type { Solicitud } from '../../models/Solicitud';
import ResponderSolicitudForm from './ResponderSolicitudForm';

vi.mock('../../hooks/useResponderSolicitudNovedadCoordinador', () => ({
  useResponderSolicitudNovedadCoordinador: vi.fn(),
}));

vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

type Mutacion = ReturnType<typeof useResponderSolicitudNovedadCoordinador>;

type OpcionesMutate = {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
};

const SOLICITUD: Solicitud = {
  id: 's-1',
  mensajeSolicitud: 'No he podido contactar a mi asesor.',
  fechaCreacion: '2026-09-01T15:30:00Z',
  tipoSolicitudId: 't-1',
  tipoSolicitudNombre: 'NOVEDAD_PARA_EL_COORDINADOR',
  remitente: {
    usuarioId: 'u-1',
    identificador: '2001',
    nombre: 'Luis Gómez',
    email: 'luis@uco.edu.co',
  },
  destinatario: { usuarioId: 'u-2', identificador: '1001', nombre: 'Ana', email: 'ana@uco.edu.co' },
};

function mockearMutacion(mutate = vi.fn(), isPending = false) {
  vi.mocked(useResponderSolicitudNovedadCoordinador).mockReturnValue({
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
  } as Mutacion);
  return mutate;
}

function crearErrorApi(cuerpo: ApiError) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: cuerpo,
    status: cuerpo.status,
    statusText: 'Bad Request',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('ResponderSolicitudForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockearMutacion();
  });

  it('muestra el contexto de la solicitud, limita el campo y habilita el envío solo con texto', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ResponderSolicitudForm solicitud={SOLICITUD} onCerrar={vi.fn()} />);
    const campo = screen.getByRole('textbox', { name: /Respuesta/ });
    const enviar = screen.getByRole('button', { name: 'Enviar respuesta' });

    // Assert inicial
    expect(screen.getByRole('dialog', { name: 'Responder solicitud' })).toHaveTextContent(
      'No he podido contactar a mi asesor.',
    );
    expect(campo).toHaveAttribute('maxLength', String(LIMITES.RESPUESTA_CONTENIDO_MAX));
    expect(enviar).toBeDisabled();

    // Act
    await user.type(campo, '   ');
    expect(enviar).toBeDisabled();
    await user.type(campo, 'Listo');

    // Assert
    expect(enviar).toBeEnabled();
  });

  it('en éxito envía solicitudId y el contenido recortado, lanza el toast y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const mutate = mockearMutacion(
      vi.fn((_req: unknown, opciones?: OpcionesMutate) => opciones?.onSuccess?.()),
    );
    render(<ResponderSolicitudForm solicitud={SOLICITUD} onCerrar={onCerrar} />);

    // Act
    await user.type(
      screen.getByRole('textbox', { name: /Respuesta/ }),
      '  Agendemos una reunión.  ',
    );
    await user.click(screen.getByRole('button', { name: 'Enviar respuesta' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { solicitudId: 's-1', contenido: 'Agendemos una reunión.' },
      expect.anything(),
    );
    expect(toast.success).toHaveBeenCalledWith(
      'Respuesta enviada',
      expect.stringContaining('Luis Gómez'),
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('en error pinta el mensaje del campo en un alert, lanza toast.error y no cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mockearMutacion(
      vi.fn((_req: unknown, opciones?: OpcionesMutate) =>
        opciones?.onError?.(
          crearErrorApi({
            status: 400,
            message: 'Datos inválidos',
            errorCode: 'RESPUESTA_CONTENIDO_REQUERIDO',
            fieldErrors: [{ field: 'contenido', message: 'La respuesta es obligatoria.' }],
          } as ApiError),
        ),
      ),
    );
    render(<ResponderSolicitudForm solicitud={SOLICITUD} onCerrar={onCerrar} />);

    // Act
    await user.type(screen.getByRole('textbox', { name: /Respuesta/ }), 'Hola');
    await user.click(screen.getByRole('button', { name: 'Enviar respuesta' }));

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('La respuesta es obligatoria.');
    expect(toast.error).toHaveBeenCalledWith('No se pudo enviar la respuesta', 'Datos inválidos');
    expect(onCerrar).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: /Respuesta/ })).toHaveValue('Hola');
  });

  it('cancelar cierra sin enviar', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const mutate = mockearMutacion();
    render(<ResponderSolicitudForm solicitud={SOLICITUD} onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('mientras envía muestra "Enviando...", bloquea Cancelar e ignora Escape', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mockearMutacion(vi.fn(), true);
    render(<ResponderSolicitudForm solicitud={SOLICITUD} onCerrar={onCerrar} />);

    // Act
    await user.keyboard('{Escape}');

    // Assert
    expect(screen.getByRole('button', { name: 'Enviando...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    expect(onCerrar).not.toHaveBeenCalled();
  });
});
