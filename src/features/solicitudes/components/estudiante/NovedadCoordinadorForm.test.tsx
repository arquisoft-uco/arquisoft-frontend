import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import NovedadCoordinadorForm from './NovedadCoordinadorForm';
import { useEnviarSolicitudNovedadCoordinador } from '../../hooks/useEnviarSolicitudNovedadCoordinador';
import { useEnviarSolicitudNovedadAsesor } from '../../hooks/useEnviarSolicitudNovedadAsesor';

vi.mock('../../hooks/useEnviarSolicitudNovedadCoordinador', () => ({
  useEnviarSolicitudNovedadCoordinador: vi.fn(),
}));

vi.mock('../../hooks/useEnviarSolicitudNovedadAsesor', () => ({
  useEnviarSolicitudNovedadAsesor: vi.fn(),
}));

const UUID_VALIDO = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
const MENSAJE_VALIDO = 'No he podido contactar a mi asesor.';

type Mutacion = ReturnType<typeof useEnviarSolicitudNovedadCoordinador>;

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

describe('NovedadCoordinadorForm', () => {
  const mutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useEnviarSolicitudNovedadCoordinador).mockReturnValue(crearMutacionMock(mutate));
  });

  it('muestra los textos del coordinador', () => {
    render(<NovedadCoordinadorForm />);

    expect(
      screen.getByRole('heading', { name: 'Enviar solicitud de novedad al coordinador' }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Destinatario \(identificador del coordinador\)/),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/reportar al coordinador/)).toBeInTheDocument();
    expect(screen.getByRole('note', { name: 'No disponible: coordinadores' })).toBeInTheDocument();
  });

  it('al confirmar envía con el hook del coordinador y nunca con el del asesor', async () => {
    const user = userEvent.setup();
    render(<NovedadCoordinadorForm />);

    await user.click(screen.getByLabelText(/Destinatario/));
    await user.paste(UUID_VALIDO);
    await user.click(screen.getByLabelText(/^Mensaje/));
    await user.paste(MENSAJE_VALIDO);
    await user.click(await screen.findByRole('button', { name: 'Enviar solicitud' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Enviar solicitud al coordinador');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(mutate).toHaveBeenCalledWith(
      { destinatario: UUID_VALIDO, mensajeSolicitud: MENSAJE_VALIDO },
      expect.anything(),
    );
    expect(useEnviarSolicitudNovedadAsesor).not.toHaveBeenCalled();
  });
});
