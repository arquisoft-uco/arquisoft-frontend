import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import ConsultarEvaluacionesAsesor from './ConsultarEvaluacionesAsesor';
import { useEvaluacionesAsignadasAsesor } from '../../hooks/useEvaluacionesAsignadasAsesor';
import { useCatalogoEstadosEvaluacion } from '../../hooks/useCatalogoEstadosEvaluacion';
import type { Page } from '../../../../shared/models/api-response';
import type { EvaluacionAsignadaAsesor } from '../../models/EvaluacionAsignadaAsesor';

vi.mock('../../hooks/useEvaluacionesAsignadasAsesor', () => ({
  useEvaluacionesAsignadasAsesor: vi.fn(),
}));
vi.mock('../../hooks/useCatalogoEstadosEvaluacion', () => ({
  useCatalogoEstadosEvaluacion: vi.fn(),
}));

const EVALUACION: EvaluacionAsignadaAsesor = {
  id: 'ea-1',
  evaluacion: { id: 'e-1', estado: { id: 'PENDIENTE', nombre: 'Pendiente' } },
  entregable: { id: 'en-1', proyecto: 'Sistema de monitoreo', version: 3 },
  tieneEvaluacionesCualitativas: false,
  tieneEvaluacionesCuantitativas: false,
  notas: { resumenCualitativo: 3.5, resumenCuantitativo: 4, notaAcumulada: 3.8 },
};

function crearPagina(content: EvaluacionAsignadaAsesor[]) {
  return {
    content,
    page: 0,
    size: 10,
    totalElements: content.length,
    totalPages: 1,
    first: true,
    last: true,
    empty: content.length === 0,
  } as Page<EvaluacionAsignadaAsesor>;
}

function mockHook(parcial: Partial<ReturnType<typeof useEvaluacionesAsignadasAsesor>> = {}) {
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
  } as ReturnType<typeof useEvaluacionesAsignadasAsesor>;
  vi.mocked(useEvaluacionesAsignadasAsesor).mockReturnValue(hook);
  return hook;
}

describe('ConsultarEvaluacionesAsesor', () => {
  beforeEach(() => {
    vi.mocked(useEvaluacionesAsignadasAsesor).mockReset();
    vi.mocked(useCatalogoEstadosEvaluacion).mockReset();
    const parcial: Partial<ReturnType<typeof useCatalogoEstadosEvaluacion>> = {
      data: [{ id: 'PENDIENTE', nombre: 'Pendiente', descripcion: '' }],
      isError: false,
      refetch: vi.fn(),
    };
    vi.mocked(useCatalogoEstadosEvaluacion).mockReturnValue({
      ...parcial,
    } as ReturnType<typeof useCatalogoEstadosEvaluacion>);
  });

  it('lista proyecto, versión y estado con la columna de acciones y sus dos botones de gestión aunque no haya evaluaciones', () => {
    // Arrange
    mockHook({ data: crearPagina([EVALUACION]) });

    // Act
    render(<ConsultarEvaluacionesAsesor />);

    // Assert
    const tabla = within(screen.getByRole('table', { name: 'Evaluaciones' }));
    expect(tabla.getByText('Sistema de monitoreo')).toBeInTheDocument();
    expect(tabla.getByText('3')).toBeInTheDocument();
    expect(tabla.getByText('Pendiente')).toBeInTheDocument();
    expect(tabla.getAllByRole('columnheader')).toHaveLength(5);
    expect(tabla.getByText('3,80')).toBeInTheDocument();
    expect(tabla.getByText('Cualitativa 3,50 · Cuantitativa 4,00')).toBeInTheDocument();
    expect(
      tabla.getAllByRole('button', { name: /^Gestionar (cuali|cuanti)tativas de/ }),
    ).toHaveLength(2);
  });

  it('sin evaluaciones muestra el vacío con el texto del asesor, no un error', () => {
    // Arrange
    mockHook({ data: crearPagina([]) });

    // Act
    render(<ConsultarEvaluacionesAsesor />);

    // Assert
    expect(screen.getByText('Aún no hay evaluaciones')).toBeInTheDocument();
    expect(
      screen.getByText('Aparecerán aquí cuando se te asocien entregables.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('con error muestra el ErrorState y "Reintentar" vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ isError: true, error: new Error('fallo') });
    render(<ConsultarEvaluacionesAsesor />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar las evaluaciones');
    expect(hook.refetch).toHaveBeenCalledTimes(1);
  });

  it('si falla el catálogo de estados avisa, deja el listado usable y "Reintentar" recarga el catálogo', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    const parcial: Partial<ReturnType<typeof useCatalogoEstadosEvaluacion>> = {
      data: undefined,
      isError: true,
      refetch,
    };
    vi.mocked(useCatalogoEstadosEvaluacion).mockReturnValue({
      ...parcial,
    } as ReturnType<typeof useCatalogoEstadosEvaluacion>);
    mockHook({ data: crearPagina([EVALUACION]) });
    render(<ConsultarEvaluacionesAsesor />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByText('No se pudieron cargar los estados para filtrar.')).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Evaluaciones' })).toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
