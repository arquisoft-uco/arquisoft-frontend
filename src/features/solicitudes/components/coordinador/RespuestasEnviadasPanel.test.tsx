import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen, within } from '../../../../test-utils/render';
import { toast } from '../../../../shared/hooks/useToast';
import type { ApiError, Page } from '../../../../shared/models/api-response';
import { useEliminarRespuestaNovedadCoordinador } from '../../hooks/useEliminarRespuestaNovedadCoordinador';
import { useRespuestasNovedadCoordinadorEnviadas } from '../../hooks/useRespuestasNovedadCoordinadorEnviadas';
import type { RespuestaSolicitud } from '../../models/RespuestaSolicitud';
import { RESPUESTA } from '../../../../test-utils/respuestas';
import RespuestasEnviadasPanel from './RespuestasEnviadasPanel';

vi.mock('../../hooks/useRespuestasNovedadCoordinadorEnviadas', () => ({
  useRespuestasNovedadCoordinadorEnviadas: vi.fn(),
}));

vi.mock('../../hooks/useEliminarRespuestaNovedadCoordinador', () => ({
  useEliminarRespuestaNovedadCoordinador: vi.fn(),
}));

vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

type HookRespuestas = ReturnType<typeof useRespuestasNovedadCoordinadorEnviadas>;
type HookEliminar = ReturnType<typeof useEliminarRespuestaNovedadCoordinador>;

type OpcionesMutate = {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
};

const RESPUESTA_EN_REVISION: RespuestaSolicitud = {
  ...RESPUESTA,
  estadoRespuestaId: 'EN_REVISION',
  estadoRespuestaNombre: 'En revisión',
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
  vi.mocked(useEliminarRespuestaNovedadCoordinador).mockReturnValue({
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
  const tabla = screen.getByRole('table', { name: 'Respuestas de novedades enviadas' });
  await user.click(
    within(tabla).getByRole('button', { name: 'Acciones de la respuesta a Luis Gómez' }),
  );
  await user.click(screen.getByRole('menuitem', { name: 'Eliminar respuesta' }));
}

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
  vi.mocked(useRespuestasNovedadCoordinadorEnviadas).mockReturnValue({
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

describe('RespuestasEnviadasPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockearEliminar();
  });

  it('muestra el esqueleto de carga y no la tabla', () => {
    // Arrange
    mockearHook({ isLoading: true });

    // Act
    render(<RespuestasEnviadasPanel page={0} onPageChange={vi.fn()} />);

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
    render(<RespuestasEnviadasPanel page={0} onPageChange={vi.fn()} />);

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar las respuestas');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('muestra el vacío cuando no hay respuestas', () => {
    // Arrange
    mockearHook({ data: crearPagina([]) });

    // Act
    render(<RespuestasEnviadasPanel page={0} onPageChange={vi.fn()} />);

    // Assert
    expect(screen.getByText('Aún no has enviado respuestas')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('con datos muestra el resumen con el total y la respuesta en la tabla', () => {
    // Arrange
    mockearHook({ data: crearPagina([RESPUESTA]) });

    // Act
    render(<RespuestasEnviadasPanel page={0} onPageChange={vi.fn()} />);

    // Assert
    expect(screen.getByText('1 respuesta')).toBeInTheDocument();
    const tabla = screen.getByRole('table', { name: 'Respuestas de novedades enviadas' });
    expect(within(tabla).getByText('Programemos una reunión.')).toBeInTheDocument();
  });

  it('con varias páginas el paginador llama a onPageChange con la siguiente', async () => {
    // Arrange
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    mockearHook({
      data: { ...crearPagina([RESPUESTA]), totalElements: 25, totalPages: 3 },
    });

    // Act
    render(<RespuestasEnviadasPanel page={0} onPageChange={onPageChange} />);
    await user.click(screen.getByRole('button', { name: 'Página siguiente' }));

    // Assert
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('ofrece el menú de eliminar solo en la fila En revisión', () => {
    // Arrange
    mockearHook({ data: crearPagina([RESPUESTA_EN_REVISION, RESPUESTA]) });

    // Act
    render(<RespuestasEnviadasPanel page={0} onPageChange={vi.fn()} />);

    // Assert
    const tabla = screen.getByRole('table', { name: 'Respuestas de novedades enviadas' });
    expect(
      within(tabla).getAllByRole('button', { name: 'Acciones de la respuesta a Luis Gómez' }),
    ).toHaveLength(1);
  });

  it('al elegir eliminar abre el diálogo con el estudiante y las consecuencias', async () => {
    // Arrange
    const user = userEvent.setup();
    mockearHook({ data: crearPagina([RESPUESTA_EN_REVISION]) });
    render(<RespuestasEnviadasPanel page={0} onPageChange={vi.fn()} />);

    // Act
    await abrirDialogoEliminar(user);

    // Assert
    const dialogo = screen.getByRole('alertdialog');
    expect(dialogo).toHaveTextContent('¿Eliminar respuesta?');
    expect(dialogo).toHaveTextContent('Vas a eliminar tu respuesta a Luis Gómez.');
    expect(dialogo).toHaveTextContent('podrás responderla de nuevo');
    expect(dialogo).toHaveTextContent('No se puede deshacer.');
  });

  it('cancelar el diálogo lo cierra sin eliminar', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = mockearEliminar();
    mockearHook({ data: crearPagina([RESPUESTA_EN_REVISION]) });
    render(<RespuestasEnviadasPanel page={0} onPageChange={vi.fn()} />);
    await abrirDialogoEliminar(user);

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
    const onPageChange = vi.fn();
    render(<RespuestasEnviadasPanel page={0} onPageChange={onPageChange} />);
    await abrirDialogoEliminar(user);

    // Act
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith('s-1', expect.any(Object));
    expect(toast.success).toHaveBeenCalledWith('Respuesta eliminada', expect.any(String));
    expect(toast.error).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(onPageChange).not.toHaveBeenCalled();
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
    render(<RespuestasEnviadasPanel page={0} onPageChange={vi.fn()} />);
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

  it('retrocede una página al eliminar la única fila de una página posterior', async () => {
    // Arrange
    const user = userEvent.setup();
    mockearEliminar(vi.fn((_id: string, opciones?: OpcionesMutate) => opciones?.onSuccess?.()));
    mockearHook({ data: crearPagina([RESPUESTA_EN_REVISION]) });
    const onPageChange = vi.fn();
    render(<RespuestasEnviadasPanel page={2} onPageChange={onPageChange} />);
    await abrirDialogoEliminar(user);

    // Act
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    // Assert
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
