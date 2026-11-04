import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router';
import { render, screen, within } from '../../../../test-utils/render';
import ConsultarEvaluacionesEstudiante from './ConsultarEvaluacionesEstudiante';
import { useEvaluacionesEstudiante } from '../../hooks/useEvaluacionesEstudiante';
import { useCatalogoEstadosEvaluacion } from '../../hooks/useCatalogoEstadosEvaluacion';
import type { Page } from '../../../../shared/models/api-response';
import type { Evaluacion } from '../../models/Evaluacion';

vi.mock('../../hooks/useEvaluacionesEstudiante', () => ({
  useEvaluacionesEstudiante: vi.fn(),
}));
vi.mock('../../hooks/useCatalogoEstadosEvaluacion', () => ({
  useCatalogoEstadosEvaluacion: vi.fn(),
}));

const EVALUACION: Evaluacion = {
  id: 'e-1',
  entregable: { id: 'en-1', proyecto: 'Sistema de monitoreo', version: 3 },
  estado: { id: 'PENDIENTE', nombre: 'Pendiente' },
};

function crearPagina(content: Evaluacion[]) {
  return {
    content,
    page: 0,
    size: 10,
    totalElements: content.length,
    totalPages: 1,
    first: true,
    last: true,
    empty: content.length === 0,
  } as Page<Evaluacion>;
}

function mockHook(parcial: Partial<ReturnType<typeof useEvaluacionesEstudiante>> = {}) {
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
  } as ReturnType<typeof useEvaluacionesEstudiante>;
  vi.mocked(useEvaluacionesEstudiante).mockReturnValue(hook);
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

describe('ConsultarEvaluacionesEstudiante', () => {
  beforeEach(() => {
    vi.mocked(useEvaluacionesEstudiante).mockReset();
    vi.mocked(useCatalogoEstadosEvaluacion).mockReset();
    mockCatalogo();
  });

  it('muestra un estado de carga accesible mientras llega la primera página', () => {
    // Arrange
    mockHook({ isLoading: true });

    // Act
    render(<ConsultarEvaluacionesEstudiante />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('lista proyecto, versión y estado en solo lectura, sin acción de asignar jurados', () => {
    // Arrange
    mockHook({ data: crearPagina([EVALUACION]) });

    // Act
    render(<ConsultarEvaluacionesEstudiante />);

    // Assert
    const tabla = within(screen.getByRole('table', { name: 'Evaluaciones' }));
    expect(tabla.getByText('Sistema de monitoreo')).toBeInTheDocument();
    expect(tabla.getByText('3')).toBeInTheDocument();
    expect(tabla.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText('1 evaluación')).toBeInTheDocument();
    expect(tabla.getAllByRole('columnheader')).toHaveLength(4);
    expect(screen.queryByRole('button', { name: /Asignar jurados/ })).not.toBeInTheDocument();
  });

  it('sin evaluaciones muestra el vacío en voz de estudiante, no un error', () => {
    // Arrange
    mockHook({ data: crearPagina([]) });

    // Act
    render(<ConsultarEvaluacionesEstudiante />);

    // Assert
    expect(screen.getByText('Aún no hay evaluaciones')).toBeInTheDocument();
    expect(screen.getByText(/de tu proyecto de grado/)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra el error con "Reintentar" que vuelve a consultar y oculta el paginador', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ isError: true, error: new Error('fallo') });
    render(<ConsultarEvaluacionesEstudiante />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar las evaluaciones');
    expect(hook.refetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('navigation', { name: 'Paginación' })).not.toBeInTheDocument();
  });

  it('si el catálogo falla avisa, no ofrece chips de estado y la búsqueda sigue', async () => {
    // Arrange
    const user = userEvent.setup();
    const catalogo = mockCatalogo({ data: undefined, isError: true });
    mockHook({ data: crearPagina([EVALUACION]) });
    render(<ConsultarEvaluacionesEstudiante />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByText('No se pudieron cargar los estados para filtrar.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'En progreso' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Buscar evaluaciones')).toBeInTheDocument();
    expect(catalogo.refetch).toHaveBeenCalledTimes(1);
  });

  it('cada fila ofrece "Ver evaluaciones del jurado" que navega a la ruta hija con el resumen y el search', async () => {
    // Arrange
    const user = userEvent.setup();
    mockHook({ data: crearPagina([EVALUACION]) });
    let estado: unknown = null;
    function Destino() {
      estado = useLocation().state;
      return <p>Destino jurados</p>;
    }
    render(
      <Routes>
        <Route path="/evaluaciones" element={<ConsultarEvaluacionesEstudiante />} />
        <Route path="/evaluaciones/:evaluacionId/jurados" element={<Destino />} />
      </Routes>,
      { initialPath: '/evaluaciones?q=sis' },
    );

    // Act
    await user.click(
      screen.getAllByRole('button', {
        name: 'Ver evaluaciones del jurado de Sistema de monitoreo',
      })[0],
    );

    // Assert
    expect(screen.getByText('Destino jurados')).toBeInTheDocument();
    expect(estado).toEqual({
      resumen: { id: 'e-1', proyecto: 'Sistema de monitoreo', version: 3 },
      search: '?q=sis',
    });
  });
});
