import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import type { Page } from '../../../../shared/models/api-response';
import type { FiltrosRespuestas } from '../../hooks/useFiltrosRespuestas';
import { useRespuestasAmpliacionPlazoEnviadas } from '../../hooks/useRespuestasAmpliacionPlazoEnviadas';
import type { RespuestaSolicitud } from '../../models/RespuestaSolicitud';
import { RESPUESTA_AMPLIACION_PLAZO } from '../../../../test-utils/respuestas';
import RespuestasAmpliacionPlazoEnviadasPanel from './RespuestasAmpliacionPlazoEnviadasPanel';

vi.mock('../../hooks/useEstadosRespuesta', () => ({
  useEstadosRespuesta: vi.fn(() => ({ data: undefined, isError: false })),
}));

vi.mock('../../hooks/useRespuestasAmpliacionPlazoEnviadas', () => ({
  useRespuestasAmpliacionPlazoEnviadas: vi.fn(),
}));

function crearFiltros(): FiltrosRespuestas {
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
  };
}

type HookRespuestas = ReturnType<typeof useRespuestasAmpliacionPlazoEnviadas>;

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
  vi.mocked(useRespuestasAmpliacionPlazoEnviadas).mockReturnValue({
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

describe('RespuestasAmpliacionPlazoEnviadasPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el esqueleto de carga y no la tabla', () => {
    // Arrange
    mockearHook({ isLoading: true });

    // Act
    render(<RespuestasAmpliacionPlazoEnviadasPanel filtros={crearFiltros()} />);

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
    render(<RespuestasAmpliacionPlazoEnviadasPanel filtros={crearFiltros()} />);

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar las respuestas');

    // Act
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('sin respuestas muestra el vacío con el texto de ampliación de plazo', () => {
    // Arrange
    mockearHook({ data: crearPagina([]) });

    // Act
    render(<RespuestasAmpliacionPlazoEnviadasPanel filtros={crearFiltros()} />);

    // Assert
    expect(screen.getByText('Aún no has enviado respuestas')).toBeInTheDocument();
    expect(
      screen.getByText(/solicitud de ampliación de plazo desde Recibidas/),
    ).toBeInTheDocument();
  });

  it('con datos muestra las filas sin menú de acciones por fila', () => {
    // Arrange
    mockearHook({ data: crearPagina([RESPUESTA_AMPLIACION_PLAZO]) });
    const filtros = crearFiltros();

    // Act
    render(<RespuestasAmpliacionPlazoEnviadasPanel filtros={filtros} />);

    // Assert
    expect(useRespuestasAmpliacionPlazoEnviadas).toHaveBeenCalledWith(filtros);
    expect(screen.getByText('1 respuesta')).toBeInTheDocument();
    const tabla = screen.getByRole('table', { name: 'Respuestas de ampliación de plazo enviadas' });
    expect(within(tabla).getByText('Luis Gómez')).toBeInTheDocument();
    expect(
      within(tabla).getByText('Necesito más tiempo para entregar el documento final.'),
    ).toBeInTheDocument();
    expect(within(tabla).getByText('Aprobamos la ampliación de plazo.')).toBeInTheDocument();
    expect(within(tabla).getByText('Aprobada')).toBeInTheDocument();
    expect(within(tabla).queryByRole('button', { name: /acciones/i })).not.toBeInTheDocument();
  });
});
