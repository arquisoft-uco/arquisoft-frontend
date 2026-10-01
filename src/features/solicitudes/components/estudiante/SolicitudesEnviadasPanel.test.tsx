import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import { toast } from '../../../../shared/hooks/useToast';
import type { ApiError, Page } from '../../../../shared/models/api-response';
import { useEliminarSolicitudNovedadCoordinador } from '../../hooks/useEliminarSolicitudNovedadCoordinador';
import { useSolicitudesNovedadCoordinadorEnviadas } from '../../hooks/useSolicitudesNovedadCoordinadorEnviadas';
import type { Solicitud } from '../../models/Solicitud';
import SolicitudesEnviadasPanel from './SolicitudesEnviadasPanel';

vi.mock('../../hooks/useSolicitudesNovedadCoordinadorEnviadas', () => ({
  useSolicitudesNovedadCoordinadorEnviadas: vi.fn(),
}));

vi.mock('../../hooks/useEliminarSolicitudNovedadCoordinador', () => ({
  useEliminarSolicitudNovedadCoordinador: vi.fn(),
}));

vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

type HookEnviadas = ReturnType<typeof useSolicitudesNovedadCoordinadorEnviadas>;
type HookEliminar = ReturnType<typeof useEliminarSolicitudNovedadCoordinador>;

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
  remitente: { usuarioId: 'u-1', identificador: '2001', nombre: 'Luis', email: 'luis@uco.edu.co' },
  destinatario: {
    usuarioId: 'u-2',
    identificador: '1001',
    nombre: 'Ana Pérez',
    email: 'ana@uco.edu.co',
  },
};

function crearPagina(content: Solicitud[]): Page<Solicitud> {
  return {
    content,
    page: 0,
    size: 10,
    totalElements: content.length,
    totalPages: 1,
    first: true,
    last: true,
    empty: content.length === 0,
  };
}

function crearHookMock(parcial: Partial<HookEnviadas> = {}): HookEnviadas {
  return {
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    page: 0,
    pageSize: 10,
    goToPage: vi.fn(),
    ...parcial,
  } as HookEnviadas;
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

function mockearEliminar(mutate = vi.fn()) {
  vi.mocked(useEliminarSolicitudNovedadCoordinador).mockReturnValue({
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
  } as HookEliminar);
  return mutate;
}

async function abrirDialogoEliminar(user: ReturnType<typeof userEvent.setup>) {
  vi.mocked(useSolicitudesNovedadCoordinadorEnviadas).mockReturnValue(
    crearHookMock({ data: crearPagina([SOLICITUD]) }),
  );
  render(<SolicitudesEnviadasPanel />);
  await user.click(
    screen.getByRole('button', { name: 'Eliminar la solicitud enviada a Ana Pérez' }),
  );
}

describe('SolicitudesEnviadasPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSolicitudesNovedadCoordinadorEnviadas).mockReset();
    mockearEliminar();
  });

  it('muestra el estado de carga y no muestra la tabla', () => {
    vi.mocked(useSolicitudesNovedadCoordinadorEnviadas).mockReturnValue(
      crearHookMock({ isLoading: true }),
    );

    render(<SolicitudesEnviadasPanel />);

    expect(screen.getByRole('status')).toHaveTextContent('Cargando solicitudes enviadas');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('muestra el texto de respaldo en un alert y no muestra la tabla', () => {
    vi.mocked(useSolicitudesNovedadCoordinadorEnviadas).mockReturnValue(
      crearHookMock({ isError: true, error: new Error('fallo de red') }),
    );

    render(<SolicitudesEnviadasPanel />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar las solicitudes enviadas.',
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('muestra el mensaje de vacío cuando no hay solicitudes', () => {
    vi.mocked(useSolicitudesNovedadCoordinadorEnviadas).mockReturnValue(
      crearHookMock({ data: crearPagina([]) }),
    );

    render(<SolicitudesEnviadasPanel />);

    expect(
      screen.getByText('Aún no has enviado solicitudes de novedad al coordinador.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('con datos muestra el contador, el destinatario y el mensaje', () => {
    vi.mocked(useSolicitudesNovedadCoordinadorEnviadas).mockReturnValue(
      crearHookMock({ data: crearPagina([SOLICITUD]) }),
    );

    render(<SolicitudesEnviadasPanel />);

    expect(screen.getByText('1 solicitud')).toBeInTheDocument();
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText(/ana@uco\.edu\.co/)).toBeInTheDocument();
    expect(screen.getByText('No he podido contactar a mi asesor.')).toBeInTheDocument();
  });

  it('al pulsar eliminar abre el diálogo con el nombre del destinatario y cancelar no elimina', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = mockearEliminar();
    await abrirDialogoEliminar(user);

    // Act
    const dialogo = screen.getByRole('dialog');
    expect(dialogo).toHaveTextContent('¿Eliminar solicitud?');
    expect(dialogo).toHaveTextContent(/Ana Pérez/);
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('al confirmar elimina por id y, en éxito, lanza el toast y cierra el diálogo', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = mockearEliminar(
      vi.fn((_id: string, opciones?: OpcionesMutate) => opciones?.onSuccess?.()),
    );
    await abrirDialogoEliminar(user);

    // Act
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith('s-1', expect.any(Object));
    expect(toast.success).toHaveBeenCalledWith(
      'Solicitud eliminada',
      expect.any(String),
    );
    expect(toast.error).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('en error lanza toast.error con el mensaje del backend y cierra el diálogo', async () => {
    // Arrange
    const user = userEvent.setup();
    mockearEliminar(
      vi.fn((_id: string, opciones?: OpcionesMutate) =>
        opciones?.onError?.(
          crearErrorApi({
            error: 'Unprocessable Entity',
            errorCode: 'SOLICITUD_CON_RESPUESTAS',
            message: 'La solicitud ya tiene respuestas y no puede eliminarse.',
            status: 422,
          }),
        ),
      ),
    );
    await abrirDialogoEliminar(user);

    // Act
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo eliminar la solicitud',
      'La solicitud ya tiene respuestas y no puede eliminarse.',
    );
    expect(toast.success).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
