import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen, within } from '../../../../test-utils/render';
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
    isFetching: false,
    isPlaceholderData: false,
    refetch: vi.fn(),
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
  const tabla = screen.getByRole('table', {
    name: 'Solicitudes de novedad enviadas al coordinador',
  });
  await user.click(
    within(tabla).getByRole('button', { name: 'Eliminar la solicitud enviada a Ana Pérez' }),
  );
}

describe('SolicitudesEnviadasPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSolicitudesNovedadCoordinadorEnviadas).mockReset();
    mockearEliminar();
  });

  it('mientras carga muestra el esqueleto y no la tabla', () => {
    // Arrange
    vi.mocked(useSolicitudesNovedadCoordinadorEnviadas).mockReturnValue(
      crearHookMock({ isLoading: true }),
    );

    // Act
    render(<SolicitudesEnviadasPanel />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent(/cargando/i);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('ante un error muestra el aviso con «Reintentar», que vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(useSolicitudesNovedadCoordinadorEnviadas).mockReturnValue(
      crearHookMock({ isError: true, error: new Error('fallo de red'), refetch }),
    );

    // Act
    render(<SolicitudesEnviadasPanel />);
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar las solicitudes');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(refetch).toHaveBeenCalled();
  });

  it('sin solicitudes muestra el vacío y no un error', () => {
    // Arrange
    vi.mocked(useSolicitudesNovedadCoordinadorEnviadas).mockReturnValue(
      crearHookMock({ data: crearPagina([]) }),
    );

    // Act
    render(<SolicitudesEnviadasPanel />);

    // Assert
    expect(screen.getByText('Aún no has enviado solicitudes')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('con datos muestra el resumen y la fila con coordinador y mensaje', () => {
    // Arrange
    vi.mocked(useSolicitudesNovedadCoordinadorEnviadas).mockReturnValue(
      crearHookMock({ data: crearPagina([SOLICITUD]) }),
    );

    // Act
    render(<SolicitudesEnviadasPanel />);

    // Assert
    const tabla = screen.getByRole('table', {
      name: 'Solicitudes de novedad enviadas al coordinador',
    });
    expect(screen.getByText('1 solicitud')).toBeInTheDocument();
    expect(within(tabla).getByText('Ana Pérez')).toBeInTheDocument();
    expect(within(tabla).getByText('ana@uco.edu.co')).toBeInTheDocument();
    expect(within(tabla).getByText('No he podido contactar a mi asesor.')).toBeInTheDocument();
  });

  it('con varias páginas el paginador pide la siguiente', async () => {
    // Arrange
    const user = userEvent.setup();
    const goToPage = vi.fn();
    vi.mocked(useSolicitudesNovedadCoordinadorEnviadas).mockReturnValue(
      crearHookMock({
        data: { ...crearPagina([SOLICITUD]), totalElements: 25, totalPages: 3 },
        goToPage,
      }),
    );

    // Act
    render(<SolicitudesEnviadasPanel />);
    await user.click(screen.getByRole('button', { name: 'Página siguiente' }));

    // Assert
    expect(goToPage).toHaveBeenCalledWith(1);
  });

  it('al pulsar eliminar abre el diálogo con el destinatario y las consecuencias', async () => {
    // Arrange
    const user = userEvent.setup();
    mockearEliminar();

    // Act
    await abrirDialogoEliminar(user);

    // Assert
    const dialogo = screen.getByRole('alertdialog');
    expect(dialogo).toHaveTextContent('¿Eliminar solicitud?');
    expect(dialogo).toHaveTextContent('Vas a eliminar la solicitud enviada a Ana Pérez.');
    expect(dialogo).toHaveTextContent('Dejará de aparecer en tus solicitudes enviadas.');
    expect(dialogo).toHaveTextContent('No se puede deshacer.');
  });

  it('cancelar el diálogo de eliminar lo cierra sin eliminar', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = mockearEliminar();
    await abrirDialogoEliminar(user);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
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
    expect(toast.success).toHaveBeenCalledWith('Solicitud eliminada', expect.any(String));
    expect(toast.error).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
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
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});
