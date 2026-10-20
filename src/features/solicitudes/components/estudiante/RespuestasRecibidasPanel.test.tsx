import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import type { Page } from '../../../../shared/models/api-response';
import type { FiltrosRespuestas } from '../../hooks/useFiltrosRespuestas';
import { useRespuestasNovedadCoordinadorRecibidas } from '../../hooks/useRespuestasNovedadCoordinadorRecibidas';
import type { RespuestaSolicitud } from '../../models/RespuestaSolicitud';
import { RESPUESTA } from '../../../../test-utils/respuestas';
import RespuestasRecibidasPanel from './RespuestasRecibidasPanel';

vi.mock('../../hooks/useEstadosRespuesta', () => ({
  useEstadosRespuesta: vi.fn(() => ({ data: undefined, isError: false })),
}));

vi.mock('../../hooks/useRespuestasNovedadCoordinadorRecibidas', () => ({
  useRespuestasNovedadCoordinadorRecibidas: vi.fn(),
}));

function crearFiltros(parcial: Partial<FiltrosRespuestas> = {}): FiltrosRespuestas {
  return {
    page: 0,
    texto: '',
    estadoIds: [],
    ordenCampo: 'fechaRespuesta',
    ordenDireccion: 'DESC',
    hayFiltros: false,
    goToPage: vi.fn(),
    setTexto: vi.fn(),
    toggleEstado: vi.fn(),
    limpiarEstados: vi.fn(),
    setOrden: vi.fn(),
    limpiarFiltros: vi.fn(),
    ...parcial,
  };
}

type HookRespuestas = ReturnType<typeof useRespuestasNovedadCoordinadorRecibidas>;

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
  vi.mocked(useRespuestasNovedadCoordinadorRecibidas).mockReturnValue({
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

describe('RespuestasRecibidasPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el esqueleto de carga y no la tabla', () => {
    // Arrange
    mockearHook({ isLoading: true });

    // Act
    render(<RespuestasRecibidasPanel filtros={crearFiltros()} />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent(/cargando/i);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('ante un error muestra el alert sin paginador y Reintentar vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    mockearHook({ isError: true, error: new Error('fallo de red'), refetch });

    // Act
    render(<RespuestasRecibidasPanel filtros={crearFiltros()} />);

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar las respuestas');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Página siguiente' })).not.toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('muestra el vacío cuando no hay respuestas', () => {
    // Arrange
    mockearHook({ data: crearPagina([]) });

    // Act
    render(<RespuestasRecibidasPanel filtros={crearFiltros()} />);

    // Assert
    expect(screen.getByText('Aún no has recibido respuestas')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('con datos muestra el resumen con el total y la respuesta en la tabla', () => {
    // Arrange
    mockearHook({ data: crearPagina([RESPUESTA]) });

    // Act
    render(<RespuestasRecibidasPanel filtros={crearFiltros()} />);

    // Assert
    expect(screen.getByText('1 respuesta')).toBeInTheDocument();
    const tabla = screen.getByRole('table', { name: 'Respuestas de novedades recibidas' });
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
    render(
      <RespuestasRecibidasPanel filtros={crearFiltros({ page: 0, goToPage: onPageChange })} />,
    );
    await user.click(screen.getByRole('button', { name: 'Página siguiente' }));

    // Assert
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('sin coincidencias con filtros activos muestra Sin resultados y Limpiar filtros los limpia', async () => {
    // Arrange
    const user = userEvent.setup();
    const limpiarFiltros = vi.fn();
    mockearHook({ data: crearPagina([]) });
    const filtros = crearFiltros({ hayFiltros: true, texto: 'zzz', limpiarFiltros });

    // Act
    render(<RespuestasRecibidasPanel filtros={filtros} />);
    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

    // Assert
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(useRespuestasNovedadCoordinadorRecibidas).toHaveBeenCalledWith(filtros);
    expect(limpiarFiltros).toHaveBeenCalled();
  });
});
