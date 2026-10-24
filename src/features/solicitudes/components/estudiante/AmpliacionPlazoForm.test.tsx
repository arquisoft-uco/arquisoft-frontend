import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import AmpliacionPlazoForm from './AmpliacionPlazoForm';
import { useEnviarSolicitudAmpliacionPlazo } from '../../hooks/useEnviarSolicitudAmpliacionPlazo';

vi.mock('../../hooks/useEnviarSolicitudAmpliacionPlazo', () => ({
  useEnviarSolicitudAmpliacionPlazo: vi.fn(),
}));

const UUID_VALIDO = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
const MENSAJE_VALIDO = 'Necesito más plazo.';

type Mutacion = ReturnType<typeof useEnviarSolicitudAmpliacionPlazo>;

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

describe('AmpliacionPlazoForm', () => {
  const mutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useEnviarSolicitudAmpliacionPlazo).mockReturnValue(crearMutacionMock(mutate));
  });

  it('muestra los textos de la ampliación de plazo', () => {
    render(<AmpliacionPlazoForm />);

    expect(
      screen.getByRole('heading', { name: 'Enviar solicitud de ampliación de plazo' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Destinatario \(UUID del coordinador\)/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/por qué necesitas ampliar el plazo/)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/catálogo de coordinadores/i);
  });

  it('al confirmar envía con el hook de la ampliación de plazo', async () => {
    const user = userEvent.setup();
    render(<AmpliacionPlazoForm />);

    await user.click(screen.getByLabelText(/Destinatario/));
    await user.paste(UUID_VALIDO);
    await user.click(screen.getByLabelText(/^Mensaje/));
    await user.paste(MENSAJE_VALIDO);
    await user.click(await screen.findByRole('button', { name: 'Enviar solicitud' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Enviar solicitud de ampliación de plazo');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(mutate).toHaveBeenCalledWith(
      { destinatario: UUID_VALIDO, mensajeSolicitud: MENSAJE_VALIDO },
      expect.anything(),
    );
  }, 15000);
});
