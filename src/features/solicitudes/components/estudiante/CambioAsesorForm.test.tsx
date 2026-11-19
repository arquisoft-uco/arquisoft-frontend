import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { useCoordinadoresEstudiante } from '../../../../shared/hooks/useCoordinadoresEstudiante';
import CambioAsesorForm from './CambioAsesorForm';
import { useEnviarSolicitudCambioAsesor } from '../../hooks/useEnviarSolicitudCambioAsesor';

vi.mock('../../hooks/useEnviarSolicitudCambioAsesor', () => ({
  useEnviarSolicitudCambioAsesor: vi.fn(),
}));

vi.mock('../../../../shared/hooks/useCoordinadoresEstudiante', () => ({
  useCoordinadoresEstudiante: vi.fn(),
}));

const COORDINADOR_ID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
const MENSAJE_VALIDO = 'Necesito cambiar de asesor.';

type Mutacion = ReturnType<typeof useEnviarSolicitudCambioAsesor>;

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

describe('CambioAsesorForm', () => {
  const mutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCoordinadoresEstudiante).mockReturnValue({
      data: [
        {
          coordinadorId: COORDINADOR_ID,
          nombre: 'Ana Gómez',
          proyectoGradoId: 'p1',
          tituloProyecto: 'Proyecto Uno',
          identificador: '1',
          email: 'ana@uco.edu.co',
        },
      ],
      isPending: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useCoordinadoresEstudiante>);
    vi.mocked(useEnviarSolicitudCambioAsesor).mockReturnValue(crearMutacionMock(mutate));
  });

  it('muestra los textos del cambio de asesor', () => {
    // Arrange
    // Act
    render(<CambioAsesorForm />);

    // Assert
    expect(
      screen.getByRole('heading', { name: 'Enviar solicitud de cambio de asesor' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Coordinador')).toBeInstanceOf(HTMLSelectElement);
    expect(screen.getByPlaceholderText(/por qué solicitas cambiar de asesor/)).toBeInTheDocument();
    expect(
      screen.queryByRole('note', { name: 'No disponible: coordinadores' }),
    ).not.toBeInTheDocument();
  });

  it('al confirmar envía con el hook del cambio de asesor', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<CambioAsesorForm />);

    // Act
    await user.selectOptions(screen.getByLabelText('Coordinador'), COORDINADOR_ID);
    await user.click(screen.getByLabelText(/^Mensaje/));
    await user.paste(MENSAJE_VALIDO);
    await user.click(await screen.findByRole('button', { name: 'Enviar solicitud' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Enviar solicitud de cambio de asesor');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { destinatario: COORDINADOR_ID, mensajeSolicitud: MENSAJE_VALIDO },
      expect.anything(),
    );
  }, 15000);
});
