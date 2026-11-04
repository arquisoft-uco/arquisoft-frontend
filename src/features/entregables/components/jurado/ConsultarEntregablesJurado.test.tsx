import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import ConsultarEntregablesJurado from './ConsultarEntregablesJurado';
import { useEntregablesJurado } from '../../hooks/useEntregablesJurado';
import { useEstadosEntregable } from '../../hooks/useEstadosEntregable';
import type { Page } from '../../../../shared/models/api-response';
import type { EntregableProyectoGrado } from '../../models/EntregableProyectoGrado';

vi.mock('../../hooks/useEntregablesJurado', () => ({
  useEntregablesJurado: vi.fn(),
}));
vi.mock('../../hooks/useEstadosEntregable', () => ({
  useEstadosEntregable: vi.fn(),
}));

const ENTREGABLE: EntregableProyectoGrado = {
  id: 'e-1',
  versionEntregable: 1,
  proyectoGrado: { id: 'p-1', nombre: 'Sistema de riego' },
  asesor: { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
  estadoEntregable: { id: 'EN_EVALUACION', nombre: 'En Evaluacion' },
};

function crearPagina(
  content: EntregableProyectoGrado[],
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
  } as Page<EntregableProyectoGrado>;
}

function mockHook(parcial: Partial<ReturnType<typeof useEntregablesJurado>> = {}) {
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
    asesor: '',
    setAsesor: vi.fn(),
    ordenCampo: 'proyectoGradoNombre',
    ordenDireccion: 'ASC',
    setOrden: vi.fn(),
    limpiarFiltros: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useEntregablesJurado>;
  vi.mocked(useEntregablesJurado).mockReturnValue(hook);
  return hook;
}

describe('ConsultarEntregablesJurado', () => {
  beforeEach(() => {
    vi.mocked(useEntregablesJurado).mockReset();
    vi.mocked(useEstadosEntregable).mockReset();
  });

  it('muestra un estado de carga accesible mientras llega la primera página', () => {
    // Arrange
    mockHook({ isLoading: true });

    // Act
    render(<ConsultarEntregablesJurado />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('muestra el error con "Reintentar" que vuelve a consultar y oculta el paginador', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ isError: true, error: new Error('fallo') });
    render(<ConsultarEntregablesJurado />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar los entregables');
    expect(hook.refetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('navigation', { name: 'Paginación' })).not.toBeInTheDocument();
  });

  it('resume el total con singular y plural y lista los entregables', () => {
    // Arrange
    mockHook({ data: crearPagina([ENTREGABLE]) });
    const { rerender } = render(<ConsultarEntregablesJurado />);

    // Assert
    expect(screen.getByText('1 entregable')).toBeInTheDocument();
    expect(
      within(screen.getByRole('table', { name: 'Entregables por evaluar' })).getByText(
        'Sistema de riego',
      ),
    ).toBeInTheDocument();

    // Act
    mockHook({ data: crearPagina([ENTREGABLE], { totalElements: 12, totalPages: 2 }) });
    rerender(<ConsultarEntregablesJurado />);

    // Assert
    expect(screen.getByText('12 entregables')).toBeInTheDocument();
  });

  it('con asesor aplicado muestra su chip y quitarlo limpia el asesor; no usa el catálogo de estados', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ data: crearPagina([ENTREGABLE]), asesor: ' Ana ' });
    render(<ConsultarEntregablesJurado />);

    // Act
    await user.click(screen.getByRole('button', { name: /Asesor: Ana/ }));

    // Assert
    expect(hook.setAsesor).toHaveBeenCalledWith('');
    expect(useEstadosEntregable).not.toHaveBeenCalled();
  });
});
