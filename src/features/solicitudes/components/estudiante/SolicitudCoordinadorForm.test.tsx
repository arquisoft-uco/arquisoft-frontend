import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { within } from '@testing-library/react';
import { render, screen } from '../../../../test-utils/render';
import SolicitudCoordinadorForm from './SolicitudCoordinadorForm';
import { useCoordinadoresEstudiante } from '../../../../shared/hooks/useCoordinadoresEstudiante';
import { toast } from '../../../../shared/hooks/useToast';

vi.mock('../../../../shared/hooks/useCoordinadoresEstudiante', () => ({
  useCoordinadoresEstudiante: vi.fn(),
}));

vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const COORDINADOR_ID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
const OTRO_COORDINADOR_ID = '9b2f4c1e-7a3d-4e58-8c61-2d5f0a9b7e14';
const MENSAJE_VALIDO = 'Necesito hablar con coordinación.';

const TEXTOS = {
  titulo: 'Enviar solicitud al coordinador',
  etiquetaDestinatario: 'Coordinador',
  placeholderMensaje: 'Describe tu solicitud',
  tituloConfirmacion: 'Enviar solicitud al coordinador',
  descripcionConfirmacion: 'Se enviará la solicitud al coordinador.',
  mensajeExito: 'Solicitud enviada',
};

type Coordinadores = ReturnType<typeof useCoordinadoresEstudiante>;

function coordinador(
  coordinadorId: string,
  nombre: string,
  proyectoGradoId: string,
  tituloProyecto: string,
) {
  return {
    coordinadorId,
    nombre,
    proyectoGradoId,
    tituloProyecto,
    identificador: '1',
    email: 'coordinador@uco.edu.co',
  };
}

function error403() {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: {},
    status: 403,
    statusText: 'Forbidden',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

function simularCoordinadores(parcial: Partial<Coordinadores>) {
  vi.mocked(useCoordinadoresEstudiante).mockReturnValue({
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    ...parcial,
  } as Coordinadores);
}

describe('SolicitudCoordinadorForm', () => {
  const enviar = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    simularCoordinadores({
      data: [coordinador(COORDINADOR_ID, 'Ana Gómez', 'p1', 'Proyecto Uno')],
    });
  });

  function renderizar() {
    return render(
      <SolicitudCoordinadorForm
        textos={TEXTOS}
        enviar={enviar}
        enviando={false}
        reiniciar={vi.fn()}
      />,
    );
  }

  it('lista solo opciones reales «Nombre — Proyecto» y no preselecciona aunque haya una sola', () => {
    // Arrange
    // Act
    renderizar();

    // Assert
    const selector = screen.getByLabelText('Coordinador');
    expect(selector).toHaveValue('');
    expect(within(selector).getByText('Selecciona un coordinador')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Ana Gómez — Proyecto Uno' })).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(1);
  });

  it('con el mismo coordinador en dos proyectos ofrece ambas opciones con el mismo valor', () => {
    // Arrange
    simularCoordinadores({
      data: [
        coordinador(COORDINADOR_ID, 'Ana Gómez', 'p1', 'Proyecto Uno'),
        coordinador(COORDINADOR_ID, 'Ana Gómez', 'p2', 'Proyecto Dos'),
        coordinador(OTRO_COORDINADOR_ID, 'Luis Pérez', 'p3', 'Proyecto Tres'),
      ],
    });

    // Act
    renderizar();

    // Assert
    expect(screen.getAllByRole('option')).toHaveLength(3);
    expect(screen.getByRole('option', { name: 'Ana Gómez — Proyecto Uno' })).toHaveValue(
      COORDINADOR_ID,
    );
    expect(screen.getByRole('option', { name: 'Ana Gómez — Proyecto Dos' })).toHaveValue(
      COORDINADOR_ID,
    );
  });

  it('mientras carga deshabilita el selector y el envío', () => {
    // Arrange
    simularCoordinadores({ isPending: true });

    // Act
    renderizar();

    // Assert
    expect(screen.getByLabelText('Coordinador')).toBeDisabled();
    expect(
      within(screen.getByLabelText('Coordinador')).getByText('Cargando coordinadores…'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar solicitud' })).toBeDisabled();
  });

  it('sin coordinadores indica que no hay coordinador asignado y bloquea el envío', () => {
    // Arrange
    simularCoordinadores({ data: [] });

    // Act
    renderizar();

    // Assert
    expect(screen.getByLabelText('Coordinador')).toBeDisabled();
    expect(
      within(screen.getByLabelText('Coordinador')).getByText(
        'No tienes un coordinador asignado actualmente',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar solicitud' })).toBeDisabled();
  });

  it('ante un error 403 avisa una sola vez y deja selector y envío deshabilitados', () => {
    // Arrange
    simularCoordinadores({ isError: true, error: error403() });

    // Act
    renderizar();

    // Assert
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudieron cargar los coordinadores',
      expect.any(String),
    );
    expect(screen.getByLabelText('Coordinador')).toBeDisabled();
    expect(
      within(screen.getByLabelText('Coordinador')).getByText(
        'No se pudieron cargar los coordinadores',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar solicitud' })).toBeDisabled();
  });

  it('al confirmar envía solo destinatario y mensaje con el coordinadorId elegido', async () => {
    // Arrange
    const user = userEvent.setup();
    renderizar();

    // Act
    await user.selectOptions(screen.getByLabelText('Coordinador'), COORDINADOR_ID);
    await user.click(screen.getByLabelText(/^Mensaje/));
    await user.paste(MENSAJE_VALIDO);
    await user.click(await screen.findByRole('button', { name: 'Enviar solicitud' }));
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    // Assert
    expect(enviar).toHaveBeenCalledTimes(1);
    expect(enviar.mock.calls[0][0]).toEqual({
      destinatario: COORDINADOR_ID,
      mensajeSolicitud: MENSAJE_VALIDO,
    });
  });

  it('sin elegir coordinador no abre el diálogo ni envía', async () => {
    // Arrange
    const user = userEvent.setup();
    renderizar();

    // Act
    await user.click(screen.getByLabelText(/^Mensaje/));
    await user.paste(MENSAJE_VALIDO);
    await user.click(await screen.findByRole('button', { name: 'Enviar solicitud' }));

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(enviar).not.toHaveBeenCalled();
  });
});
