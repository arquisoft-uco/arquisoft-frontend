import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen, within } from '../../../../test-utils/render';
import { toast } from '../../../../shared/hooks/useToast';
import { useEliminarRespuestaRegistroModificacionUsuarios } from '../../hooks/useEliminarRespuestaRegistroModificacionUsuarios';
import type { ApiError, Page } from '../../../../shared/models/api-response';
import type { FiltrosRespuestas } from '../../hooks/useFiltrosRespuestas';
import { useModificarEstadoRespuestaRegistroModificacionUsuarios } from '../../hooks/useModificarEstadoRespuestaRegistroModificacionUsuarios';
import { useRespuestasRegistroModificacionUsuariosEnviadas } from '../../hooks/useRespuestasRegistroModificacionUsuariosEnviadas';
import type { RespuestaSolicitud } from '../../models/RespuestaSolicitud';
import { RESPUESTA_REGISTRO_MODIFICACION_USUARIOS } from '../../../../test-utils/respuestas';
import RespuestasRegistroModificacionUsuariosEnviadasPanel from './RespuestasRegistroModificacionUsuariosEnviadasPanel';

vi.mock('../../hooks/useEstadosRespuesta', () => ({
  useEstadosRespuesta: vi.fn(() => ({ data: undefined, isError: false })),
}));

vi.mock('../../hooks/useRespuestasRegistroModificacionUsuariosEnviadas', () => ({
  useRespuestasRegistroModificacionUsuariosEnviadas: vi.fn(),
}));

vi.mock('../../hooks/useModificarEstadoRespuestaRegistroModificacionUsuarios', () => ({
  useModificarEstadoRespuestaRegistroModificacionUsuarios: vi.fn(),
}));

vi.mock('../../hooks/useEliminarRespuestaRegistroModificacionUsuarios', () => ({
  useEliminarRespuestaRegistroModificacionUsuarios: vi.fn(),
}));

vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

type HookModificar = ReturnType<typeof useModificarEstadoRespuestaRegistroModificacionUsuarios>;
type HookEliminar = ReturnType<typeof useEliminarRespuestaRegistroModificacionUsuarios>;

type OpcionesMutate = {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
};

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
  vi.mocked(useEliminarRespuestaRegistroModificacionUsuarios).mockReturnValue({
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
  const tabla = screen.getByRole('table', {
    name: 'Respuestas de registro y modificación de usuarios enviadas',
  });
  await user.click(
    within(tabla).getByRole('button', { name: 'Acciones de la respuesta a Luis Gómez' }),
  );
  await user.click(screen.getByRole('menuitem', { name: 'Eliminar respuesta' }));
}

const RESPUESTA_EN_REVISION: RespuestaSolicitud = {
  ...RESPUESTA_REGISTRO_MODIFICACION_USUARIOS,
  estadoRespuestaId: 'EN_REVISION',
  estadoRespuestaNombre: 'En revisión',
};

function mockearModificar(mutate = vi.fn()) {
  vi.mocked(useModificarEstadoRespuestaRegistroModificacionUsuarios).mockReturnValue({
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
  } as HookModificar);
  return mutate;
}

function crearFiltros(parcial: Partial<FiltrosRespuestas> = {}): FiltrosRespuestas {
  return {
    page: 0,
    estadoIds: [],
    ordenCampo: 'fechaRespuesta',
    ordenDireccion: 'DESC',
    hayFiltros: false,
    goToPage: vi.fn(),
    toggleEstado: vi.fn(),
    setOrden: vi.fn(),
    limpiarFiltros: vi.fn(),
    ...parcial,
  };
}

type HookRespuestas = ReturnType<typeof useRespuestasRegistroModificacionUsuariosEnviadas>;

function crearPagina(content: RespuestaSolicitud[]): Page<RespuestaSolicitud> {
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

function mockearHook(parcial: Partial<HookRespuestas> = {}) {
  vi.mocked(useRespuestasRegistroModificacionUsuariosEnviadas).mockReturnValue({
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    isFetching: false,
    isPlaceholderData: false,
    refetch: vi.fn(),
    pageSize: 10,
    ...parcial,
  } as HookRespuestas);
}

describe('RespuestasRegistroModificacionUsuariosEnviadasPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockearModificar();
    mockearEliminar();
  });

  it('muestra el esqueleto de carga y no la tabla', () => {
    // Arrange
    mockearHook({ isLoading: true });

    // Act
    render(<RespuestasRegistroModificacionUsuariosEnviadasPanel filtros={crearFiltros()} />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent(/cargando/i);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('ante un error muestra el alert y Reintentar vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    mockearHook({ isError: true, error: new Error('fallo de red'), refetch });

    // Act
    render(<RespuestasRegistroModificacionUsuariosEnviadasPanel filtros={crearFiltros()} />);
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar las respuestas');
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('sin respuestas ni filtros muestra el vacío con el siguiente paso', () => {
    // Arrange
    mockearHook({ data: crearPagina([]) });

    // Act
    render(<RespuestasRegistroModificacionUsuariosEnviadasPanel filtros={crearFiltros()} />);

    // Assert
    expect(screen.getByText('Aún no has enviado respuestas')).toBeInTheDocument();
    expect(screen.getByText(/respondas una solicitud desde Recibidas/)).toBeInTheDocument();
  });

  it('sin resultados con filtros muestra Sin resultados y Limpiar filtros los limpia', async () => {
    // Arrange
    const user = userEvent.setup();
    const limpiarFiltros = vi.fn();
    mockearHook({ data: crearPagina([]) });

    // Act
    render(
      <RespuestasRegistroModificacionUsuariosEnviadasPanel
        filtros={crearFiltros({ hayFiltros: true, estadoIds: ['APROBADA'], limpiarFiltros })}
      />,
    );
    await user.click(screen.getAllByRole('button', { name: /limpiar filtros/i })[0]);

    // Assert
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(limpiarFiltros).toHaveBeenCalled();
  });

  it('con datos muestra el coordinador, el mensaje, la respuesta y el estado sin acciones', () => {
    // Arrange
    mockearHook({ data: crearPagina([RESPUESTA_REGISTRO_MODIFICACION_USUARIOS]) });
    const filtros = crearFiltros();

    // Act
    render(<RespuestasRegistroModificacionUsuariosEnviadasPanel filtros={filtros} />);

    // Assert
    expect(useRespuestasRegistroModificacionUsuariosEnviadas).toHaveBeenCalledWith(filtros);
    expect(screen.getByText('1 respuesta')).toBeInTheDocument();
    const tabla = screen.getByRole('table', {
      name: 'Respuestas de registro y modificación de usuarios enviadas',
    });
    expect(within(tabla).getByText('Luis Gómez')).toBeInTheDocument();
    expect(within(tabla).getByText('2001 · luis@uco.edu.co')).toBeInTheDocument();
    expect(
      within(tabla).getByText('Solicito el registro de un nuevo usuario en la plataforma.'),
    ).toBeInTheDocument();
    expect(within(tabla).getByText('Aprobamos el registro del usuario.')).toBeInTheDocument();
    expect(within(tabla).getByText('Aprobada')).toBeInTheDocument();
    expect(within(tabla).queryByRole('button', { name: /acciones/i })).not.toBeInTheDocument();
  });
  it('ofrece el menú solo en la fila En revisión con aprobar, no aprobar y eliminar', async () => {
    // Arrange
    const user = userEvent.setup();
    mockearHook({
      data: crearPagina([RESPUESTA_EN_REVISION, RESPUESTA_REGISTRO_MODIFICACION_USUARIOS]),
    });
    render(<RespuestasRegistroModificacionUsuariosEnviadasPanel filtros={crearFiltros()} />);
    const tabla = screen.getByRole('table', {
      name: 'Respuestas de registro y modificación de usuarios enviadas',
    });

    // Act
    const botones = within(tabla).getAllByRole('button', {
      name: 'Acciones de la respuesta a Luis Gómez',
    });
    await user.click(botones[0]);

    // Assert
    expect(botones).toHaveLength(1);
    expect(screen.getByRole('menuitem', { name: 'Aprobar respuesta' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Marcar como no aprobada' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Eliminar respuesta' })).toBeInTheDocument();
  });

  it('elegir aprobar abre el diálogo del coordinador y confirmar envía el estado', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = mockearModificar();
    mockearHook({ data: crearPagina([RESPUESTA_EN_REVISION]) });
    render(<RespuestasRegistroModificacionUsuariosEnviadasPanel filtros={crearFiltros()} />);

    // Act
    await user.click(
      within(
        screen.getByRole('table', {
          name: 'Respuestas de registro y modificación de usuarios enviadas',
        }),
      ).getByRole('button', { name: 'Acciones de la respuesta a Luis Gómez' }),
    );
    await user.click(screen.getByRole('menuitem', { name: 'Aprobar respuesta' }));

    // Assert
    const dialogo = screen.getByRole('dialog');
    expect(dialogo).toHaveTextContent('¿Aprobar respuesta?');
    expect(dialogo).toHaveTextContent('El coordinador recibirá un aviso por correo.');
    expect(mutate).not.toHaveBeenCalled();

    // Act
    await user.click(within(dialogo).getByRole('button', { name: 'Aprobar' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { solicitudId: 's-5', nuevoEstado: 'APROBADA' },
      expect.any(Object),
    );
  });

  it('al elegir eliminar abre el diálogo y cancelar lo cierra sin eliminar', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = mockearEliminar();
    mockearHook({ data: crearPagina([RESPUESTA_EN_REVISION]) });
    render(<RespuestasRegistroModificacionUsuariosEnviadasPanel filtros={crearFiltros()} />);

    // Act
    await abrirDialogoEliminar(user);

    // Assert
    const dialogo = screen.getByRole('alertdialog');
    expect(dialogo).toHaveTextContent('¿Eliminar respuesta?');
    expect(dialogo).toHaveTextContent('Vas a eliminar tu respuesta a Luis Gómez.');
    expect(dialogo).toHaveTextContent('podrás responderla de nuevo');
    expect(dialogo).toHaveTextContent('No se puede deshacer.');

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('al confirmar elimina por el id de la solicitud, lanza el toast y cierra el diálogo', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = mockearEliminar(
      vi.fn((_id: string, opciones?: OpcionesMutate) => opciones?.onSuccess?.()),
    );
    mockearHook({ data: crearPagina([RESPUESTA_EN_REVISION]) });
    const goToPage = vi.fn();
    render(
      <RespuestasRegistroModificacionUsuariosEnviadasPanel filtros={crearFiltros({ goToPage })} />,
    );
    await abrirDialogoEliminar(user);

    // Act
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith('s-5', expect.any(Object));
    expect(toast.success).toHaveBeenCalledWith('Respuesta eliminada', expect.any(String));
    expect(toast.error).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(goToPage).not.toHaveBeenCalled();
  });

  it('en error lanza toast.error con el mensaje del backend y cierra el diálogo', async () => {
    // Arrange
    const user = userEvent.setup();
    mockearEliminar(
      vi.fn((_id: string, opciones?: OpcionesMutate) =>
        opciones?.onError?.(
          crearErrorApi({
            error: 'Unprocessable Entity',
            errorCode: 'RESPUESTA_NO_EN_REVISION',
            message: 'La respuesta ya fue evaluada y no puede eliminarse.',
            status: 422,
          }),
        ),
      ),
    );
    mockearHook({ data: crearPagina([RESPUESTA_EN_REVISION]) });
    render(<RespuestasRegistroModificacionUsuariosEnviadasPanel filtros={crearFiltros()} />);
    await abrirDialogoEliminar(user);

    // Act
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo eliminar la respuesta',
      'La respuesta ya fue evaluada y no puede eliminarse.',
    );
    expect(toast.success).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('retrocede una página solo si se elimina la única fila de una página posterior', async () => {
    // Arrange
    const user = userEvent.setup();
    mockearEliminar(vi.fn((_id: string, opciones?: OpcionesMutate) => opciones?.onSuccess?.()));
    mockearHook({ data: crearPagina([RESPUESTA_EN_REVISION]) });
    const goToPage = vi.fn();
    render(
      <RespuestasRegistroModificacionUsuariosEnviadasPanel
        filtros={crearFiltros({ page: 2, goToPage })}
      />,
    );
    await abrirDialogoEliminar(user);

    // Act
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    // Assert
    expect(goToPage).toHaveBeenCalledWith(1);
  });

  it('no retrocede si la página aún tiene más filas', async () => {
    // Arrange
    const user = userEvent.setup();
    mockearEliminar(vi.fn((_id: string, opciones?: OpcionesMutate) => opciones?.onSuccess?.()));
    mockearHook({
      data: crearPagina([RESPUESTA_EN_REVISION, RESPUESTA_REGISTRO_MODIFICACION_USUARIOS]),
    });
    const goToPage = vi.fn();
    render(
      <RespuestasRegistroModificacionUsuariosEnviadasPanel
        filtros={crearFiltros({ page: 2, goToPage })}
      />,
    );
    await abrirDialogoEliminar(user);

    // Act
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    // Assert
    expect(goToPage).not.toHaveBeenCalled();
  });
});
