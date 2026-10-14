import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import ConsultarEvaluacionesCoordinador from './ConsultarEvaluacionesCoordinador';
import { useEvaluacionesCoordinador } from '../../hooks/useEvaluacionesCoordinador';
import { useCatalogoEstadosEvaluacion } from '../../hooks/useCatalogoEstadosEvaluacion';
import type { Page } from '../../../../shared/models/api-response';
import type { Evaluacion } from '../../models/Evaluacion';

vi.mock('../../hooks/useEvaluacionesCoordinador', () => ({
  useEvaluacionesCoordinador: vi.fn(),
}));
vi.mock('../../hooks/useCatalogoEstadosEvaluacion', () => ({
  useCatalogoEstadosEvaluacion: vi.fn(),
}));

const EVALUACION: Evaluacion = {
  id: 'e-1',
  entregable: { id: 'en-1', proyecto: 'Sistema de monitoreo', version: 1 },
  estado: { id: 'PENDIENTE', nombre: 'Pendiente' },
};

function crearPagina(
  content: Evaluacion[],
  { totalPages = 1, totalElements = content.length } = {},
) {
  return {
    content,
    page: 0,
    size: 10,
    totalElements,
    totalPages,
    first: true,
    last: totalPages <= 1,
    empty: content.length === 0,
  } as Page<Evaluacion>;
}

function mockHook(parcial: Partial<ReturnType<typeof useEvaluacionesCoordinador>> = {}) {
  const hook = {
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
    texto: '',
    setTexto: vi.fn(),
    estadoIds: [],
    toggleEstado: vi.fn(),
    limpiarEstados: vi.fn(),
    ordenCampo: 'proyecto',
    ordenDireccion: 'ASC',
    setOrden: vi.fn(),
    limpiarFiltros: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useEvaluacionesCoordinador>;
  vi.mocked(useEvaluacionesCoordinador).mockReturnValue(hook);
  return hook;
}

function mockCatalogo(parcial: Partial<ReturnType<typeof useCatalogoEstadosEvaluacion>> = {}) {
  const catalogo = {
    data: [
      { id: 'PENDIENTE', nombre: 'Pendiente', descripcion: '' },
      { id: 'EN_PROGRESO', nombre: 'En progreso', descripcion: '' },
    ],
    isError: false,
    refetch: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useCatalogoEstadosEvaluacion>;
  vi.mocked(useCatalogoEstadosEvaluacion).mockReturnValue(catalogo);
  return catalogo;
}

describe('ConsultarEvaluacionesCoordinador', () => {
  beforeEach(() => {
    vi.mocked(useEvaluacionesCoordinador).mockReset();
    vi.mocked(useCatalogoEstadosEvaluacion).mockReset();
    mockCatalogo();
  });

  it('muestra un estado de carga accesible mientras llega la primera página', () => {
    // Arrange
    mockHook({ isLoading: true });

    // Act
    render(<ConsultarEvaluacionesCoordinador />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('muestra el error con "Reintentar" que vuelve a consultar y oculta el paginador', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ isError: true, error: new Error('fallo') });
    render(<ConsultarEvaluacionesCoordinador />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar las evaluaciones');
    expect(hook.refetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('navigation', { name: 'Paginación' })).not.toBeInTheDocument();
  });

  it('resume el total con singular y plural y lista las evaluaciones', () => {
    // Arrange
    mockHook({ data: crearPagina([EVALUACION]) });
    const { rerender } = render(<ConsultarEvaluacionesCoordinador />);

    // Assert
    expect(screen.getByText('1 evaluación')).toBeInTheDocument();
    expect(
      within(screen.getByRole('table', { name: 'Evaluaciones' })).getByText('Sistema de monitoreo'),
    ).toBeInTheDocument();

    // Act
    mockHook({ data: crearPagina([EVALUACION], { totalElements: 12, totalPages: 2 }) });
    rerender(<ConsultarEvaluacionesCoordinador />);

    // Assert
    expect(screen.getByText('12 evaluaciones')).toBeInTheDocument();
  });

  it('con el catálogo cargado ofrece chips con los nombres del backend que alternan el id', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ data: crearPagina([EVALUACION]) });
    render(<ConsultarEvaluacionesCoordinador />);

    // Act
    await user.click(screen.getByRole('button', { name: 'En progreso' }));

    // Assert
    expect(hook.toggleEstado).toHaveBeenCalledWith('EN_PROGRESO');
  });

  it('si el catálogo falla avisa, no ofrece chips, permite reintentar y la búsqueda sigue', async () => {
    // Arrange
    const user = userEvent.setup();
    const catalogo = mockCatalogo({ data: undefined, isError: true });
    mockHook({ data: crearPagina([EVALUACION]) });
    render(<ConsultarEvaluacionesCoordinador />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByText('No se pudieron cargar los estados para filtrar.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'En progreso' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Buscar evaluaciones')).toBeInTheDocument();
    expect(catalogo.refetch).toHaveBeenCalledTimes(1);
  });
});
