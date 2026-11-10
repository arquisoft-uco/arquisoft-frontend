import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import ConsultarEvaluacionesAsesor from './ConsultarEvaluacionesAsesor';
import { useEvaluacionesAsesor } from '../../hooks/useEvaluacionesAsesor';
import { useCatalogoEstadosEvaluacion } from '../../hooks/useCatalogoEstadosEvaluacion';
import type { Page } from '../../../../shared/models/api-response';
import type { Evaluacion } from '../../models/Evaluacion';

vi.mock('../../hooks/useEvaluacionesAsesor', () => ({
  useEvaluacionesAsesor: vi.fn(),
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

function mockHook(parcial: Partial<ReturnType<typeof useEvaluacionesAsesor>> = {}) {
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
  } as ReturnType<typeof useEvaluacionesAsesor>;
  vi.mocked(useEvaluacionesAsesor).mockReturnValue(hook);
  return hook;
}

describe('ConsultarEvaluacionesAsesor', () => {
  beforeEach(() => {
    vi.mocked(useEvaluacionesAsesor).mockReset();
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

  it('lista proyecto, versión y estado en solo lectura, sin columna ni botones de acción', () => {
    // Arrange
    mockHook({ data: crearPagina([EVALUACION]) });

    // Act
    render(<ConsultarEvaluacionesAsesor />);

    // Assert
    const tabla = within(screen.getByRole('table', { name: 'Evaluaciones' }));
    expect(tabla.getByText('Sistema de monitoreo')).toBeInTheDocument();
    expect(tabla.getByText('3')).toBeInTheDocument();
    expect(tabla.getByText('Pendiente')).toBeInTheDocument();
    expect(tabla.getAllByRole('columnheader')).toHaveLength(3);
    expect(
      tabla.queryByRole('button', { name: /Ver evaluaciones|Asignar/ }),
    ).not.toBeInTheDocument();
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
});
