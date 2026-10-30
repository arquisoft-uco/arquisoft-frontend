import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LIMITES } from '../../../../shared/validation';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import RegistroModificacionUsuariosForm from './RegistroModificacionUsuariosForm';
import { useEnviarSolicitudRegistroModificacionUsuarios } from '../../hooks/useEnviarSolicitudRegistroModificacionUsuarios';

vi.mock('../../hooks/useEnviarSolicitudRegistroModificacionUsuarios', () => ({
  useEnviarSolicitudRegistroModificacionUsuarios: vi.fn(),
}));

const UUID_VALIDO = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
const MENSAJE_VALIDO = 'Necesito registrar un usuario.';

type Mutacion = ReturnType<typeof useEnviarSolicitudRegistroModificacionUsuarios>;

function crearMutacionMock(mutate: Mutacion['mutate']): Mutacion {
  return {
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
  } as Mutacion;
}

describe('RegistroModificacionUsuariosForm', () => {
  const mutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useEnviarSolicitudRegistroModificacionUsuarios).mockReturnValue(
      crearMutacionMock(mutate),
    );
  });

  it('muestra los textos de registro y modificación de usuarios', () => {
    render(<RegistroModificacionUsuariosForm />);

    expect(
      screen.getByRole('heading', {
        name: 'Enviar solicitud de registro y modificación de usuarios',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Destinatario \(identificador del administrador\)/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('note', { name: 'No disponible: administradores' }),
    ).toBeInTheDocument();
  });

  it('al confirmar con datos válidos envía el request', async () => {
    const user = userEvent.setup();
    render(<RegistroModificacionUsuariosForm />);

    await user.click(screen.getByLabelText(/Destinatario/));
    await user.paste(UUID_VALIDO);
    await user.click(screen.getByLabelText(/^Mensaje/));
    await user.paste(MENSAJE_VALIDO);
    await user.click(await screen.findByRole('button', { name: 'Enviar solicitud' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Enviar' }));

    expect(mutate).toHaveBeenCalledWith(
      { destinatario: UUID_VALIDO, mensajeSolicitud: MENSAJE_VALIDO },
      expect.anything(),
    );
  });

  it('con campos inválidos no envía y muestra los errores', async () => {
    const user = userEvent.setup();
    render(<RegistroModificacionUsuariosForm />);

    await user.click(screen.getByLabelText(/Destinatario/));
    await user.paste('no-es-uuid');
    await user.click(screen.getByLabelText(/^Mensaje/));
    await user.paste('x'.repeat(LIMITES.MENSAJE_SOLICITUD_MAX + 1));
    await user.click(await screen.findByRole('button', { name: 'Enviar solicitud' }));

    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });
});
