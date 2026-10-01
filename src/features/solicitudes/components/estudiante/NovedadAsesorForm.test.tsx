import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import NovedadAsesorForm from './NovedadAsesorForm';
import { useEnviarSolicitudNovedadAsesor } from '../../hooks/useEnviarSolicitudNovedadAsesor';
import { useEnviarSolicitudNovedadCoordinador } from '../../hooks/useEnviarSolicitudNovedadCoordinador';

vi.mock('../../hooks/useEnviarSolicitudNovedadAsesor', () => ({
  useEnviarSolicitudNovedadAsesor: vi.fn(),
}));

vi.mock('../../hooks/useEnviarSolicitudNovedadCoordinador', () => ({
  useEnviarSolicitudNovedadCoordinador: vi.fn(),
}));

const UUID_VALIDO = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
const MENSAJE_VALIDO = 'Mi asesor no ha respondido.';

type Mutacion = ReturnType<typeof useEnviarSolicitudNovedadAsesor>;

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

describe('NovedadAsesorForm', () => {
  const mutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useEnviarSolicitudNovedadAsesor).mockReturnValue(crearMutacionMock(mutate));
  });

  it('muestra los textos del asesor', () => {
    render(<NovedadAsesorForm />);

    expect(
      screen.getByRole('heading', { name: 'Enviar solicitud de novedad al asesor' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Destinatario \(UUID del asesor\)/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/reportar al asesor/)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/catálogo de asesores/i);
  });

  it('al confirmar envía con el hook del asesor y nunca con el del coordinador', async () => {
    const user = userEvent.setup();
    render(<NovedadAsesorForm />);

    await user.click(screen.getByLabelText(/Destinatario/));
    await user.paste(UUID_VALIDO);
    await user.click(screen.getByLabelText(/^Mensaje/));
    await user.paste(MENSAJE_VALIDO);
    await user.click(await screen.findByRole('button', { name: 'Enviar solicitud' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Enviar solicitud al asesor');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(mutate).toHaveBeenCalledWith(
      { destinatario: UUID_VALIDO, mensajeSolicitud: MENSAJE_VALIDO },
      expect.anything(),
    );
    expect(useEnviarSolicitudNovedadCoordinador).not.toHaveBeenCalled();
  });
});
