import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import type { Page } from '../../../../shared/models/api-response';
import type { FiltrosRespuestas } from '../../hooks/useFiltrosRespuestas';
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
});
