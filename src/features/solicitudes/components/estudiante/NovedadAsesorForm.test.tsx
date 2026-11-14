import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { within } from '@testing-library/react';
import { render, screen } from '../../../../test-utils/render';
import NovedadAsesorForm from './NovedadAsesorForm';
import { useEnviarSolicitudNovedadAsesor } from '../../hooks/useEnviarSolicitudNovedadAsesor';
import { useEnviarSolicitudNovedadCoordinador } from '../../hooks/useEnviarSolicitudNovedadCoordinador';
import { useAsesoresActualesEstudiante } from '../../../../shared/hooks/useAsesoresActualesEstudiante';
import { toast } from '../../../../shared/hooks/useToast';

vi.mock('../../hooks/useEnviarSolicitudNovedadAsesor', () => ({
  useEnviarSolicitudNovedadAsesor: vi.fn(),
}));

vi.mock('../../hooks/useEnviarSolicitudNovedadCoordinador', () => ({
  useEnviarSolicitudNovedadCoordinador: vi.fn(),
}));

vi.mock('../../../../shared/hooks/useAsesoresActualesEstudiante', () => ({
  useAsesoresActualesEstudiante: vi.fn(),
}));

vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const ASESOR_ID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
const OTRO_ASESOR_ID = '9b2f4c1e-7a3d-4e58-8c61-2d5f0a9b7e14';
const MENSAJE_VALIDO = 'Mi asesor no ha respondido.';

type Mutacion = ReturnType<typeof useEnviarSolicitudNovedadAsesor>;
type Asesores = ReturnType<typeof useAsesoresActualesEstudiante>;

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

function asesor(asesorId: string, nombre: string, proyectoGradoId: string, tituloProyecto: string) {
  return {
    asesorId,
    nombre,
    proyectoGradoId,
    tituloProyecto,
    identificador: '1',
    email: 'asesor@uco.edu.co',
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

function simularAsesores(parcial: Partial<Asesores>) {
  vi.mocked(useAsesoresActualesEstudiante).mockReturnValue({
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    ...parcial,
  } as Asesores);
}

async function enviarConMensaje(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByLabelText(/^Mensaje/));
  await user.paste(MENSAJE_VALIDO);
  await user.click(await screen.findByRole('button', { name: 'Enviar solicitud' }));
}

describe('NovedadAsesorForm', () => {
  const mutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useEnviarSolicitudNovedadAsesor).mockReturnValue(crearMutacionMock(mutate));
    simularAsesores({ data: [asesor(ASESOR_ID, 'Ana Gómez', 'p1', 'Proyecto Uno')] });
  });

  it('muestra los textos del asesor y las opciones con nombre y proyecto', () => {
    render(<NovedadAsesorForm />);

    expect(
      screen.getByRole('heading', { name: 'Enviar solicitud de novedad al asesor' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Asesor')).toHaveValue('');
    expect(
      within(screen.getByLabelText('Asesor')).getByText('Selecciona un asesor'),
    ).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Ana Gómez — Proyecto Uno' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/reportar al asesor/)).toBeInTheDocument();
    expect(screen.queryByRole('note', { name: 'No disponible: asesores' })).not.toBeInTheDocument();
  });

  it('al confirmar envía el asesorId con el hook del asesor y nunca con el del coordinador', async () => {
    const user = userEvent.setup();
    render(<NovedadAsesorForm />);

    await user.selectOptions(screen.getByLabelText('Asesor'), ASESOR_ID);
    await enviarConMensaje(user);
    expect(screen.getByRole('dialog')).toHaveTextContent('Enviar solicitud al asesor');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(mutate).toHaveBeenCalledWith(
      { destinatario: ASESOR_ID, mensajeSolicitud: MENSAJE_VALIDO },
      expect.anything(),
    );
    expect(useEnviarSolicitudNovedadCoordinador).not.toHaveBeenCalled();
  });

  it('con el mismo asesor en dos proyectos ofrece ambas opciones y envía el mismo asesorId', async () => {
    const user = userEvent.setup();
    simularAsesores({
      data: [
        asesor(ASESOR_ID, 'Ana Gómez', 'p1', 'Proyecto Uno'),
        asesor(ASESOR_ID, 'Ana Gómez', 'p2', 'Proyecto Dos'),
        asesor(OTRO_ASESOR_ID, 'Luis Pérez', 'p3', 'Proyecto Tres'),
      ],
    });
    render(<NovedadAsesorForm />);

    await user.selectOptions(screen.getByLabelText('Asesor'), 'Ana Gómez — Proyecto Dos');
    await enviarConMensaje(user);
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(screen.getAllByRole('option')).toHaveLength(3);
    expect(mutate).toHaveBeenCalledWith(
      { destinatario: ASESOR_ID, mensajeSolicitud: MENSAJE_VALIDO },
      expect.anything(),
    );
  });

  it('sin elegir asesor muestra el error del campo y no abre el diálogo', async () => {
    const user = userEvent.setup();
    render(<NovedadAsesorForm />);

    await enviarConMensaje(user);

    expect((await screen.findAllByText('Identificador inválido')).length).toBeGreaterThan(0);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('mientras carga deshabilita el selector y el envío', () => {
    simularAsesores({ isPending: true });
    render(<NovedadAsesorForm />);

    expect(screen.getByLabelText('Asesor')).toBeDisabled();
    expect(
      within(screen.getByLabelText('Asesor')).getByText('Cargando asesores…'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar solicitud' })).toBeDisabled();
  });

  it('sin asesores indica que no hay asesor asignado y bloquea el envío', () => {
    simularAsesores({ data: [] });
    render(<NovedadAsesorForm />);

    expect(screen.getByLabelText('Asesor')).toBeDisabled();
    expect(
      within(screen.getByLabelText('Asesor')).getByText('No tienes un asesor asignado actualmente'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar solicitud' })).toBeDisabled();
  });

  it('ante un error 403 avisa una sola vez y deja el selector deshabilitado', () => {
    simularAsesores({ isError: true, error: error403() });
    render(<NovedadAsesorForm />);

    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Asesor')).toBeDisabled();
    expect(
      within(screen.getByLabelText('Asesor')).getByText('No se pudieron cargar los asesores'),
    ).toBeInTheDocument();
  });
});
