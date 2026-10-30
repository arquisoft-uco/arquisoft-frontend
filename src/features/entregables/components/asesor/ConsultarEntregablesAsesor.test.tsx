import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import ConsultarEntregablesAsesor from './ConsultarEntregablesAsesor';
import { useEntregablesAsesor } from '../../hooks/useEntregablesAsesor';
import { useEstadosEntregable } from '../../hooks/useEstadosEntregable';
import { useCambiarEstadoEntregable } from '../../hooks/useCambiarEstadoEntregable';
import { useArtefactosEntregable } from '../../hooks/useArtefactosEntregable';
import type { Page } from '../../../../shared/models/api-response';
import type { EntregableProyectoGrado } from '../../models/EntregableProyectoGrado';

vi.mock('../../hooks/useEntregablesAsesor', () => ({
  useEntregablesAsesor: vi.fn(),
}));
vi.mock('../../hooks/useEstadosEntregable', () => ({
  useEstadosEntregable: vi.fn(),
}));
vi.mock('../../hooks/useCambiarEstadoEntregable', () => ({
  useCambiarEstadoEntregable: vi.fn(),
}));
vi.mock('../../hooks/useArtefactosEntregable', () => ({
  useArtefactosEntregable: vi.fn(),
}));

const ENTREGABLE: EntregableProyectoGrado = {
  id: 'e-1',
  versionEntregable: 1,
  proyectoGrado: { id: 'p-1', nombre: 'Sistema de riego' },
  asesor: { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
  estadoEntregable: { id: 'APROBADO', nombre: 'Aprobado' },
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

function mockHook(parcial: Partial<ReturnType<typeof useEntregablesAsesor>> = {}) {
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
    ordenCampo: 'proyectoGradoNombre',
    ordenDireccion: 'ASC',
    setOrden: vi.fn(),
    limpiarFiltros: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useEntregablesAsesor>;
  vi.mocked(useEntregablesAsesor).mockReturnValue(hook);
  return hook;
}

function mockCatalogo(data?: { id: string; nombre: string; descripcion: string }[]) {
  vi.mocked(useEstadosEntregable).mockReturnValue({
    data,
  } as ReturnType<typeof useEstadosEntregable>);
}

describe('ConsultarEntregablesAsesor', () => {
  beforeEach(() => {
    vi.mocked(useEntregablesAsesor).mockReset();
    vi.mocked(useEstadosEntregable).mockReset();
    mockCatalogo(undefined);
    vi.mocked(useCambiarEstadoEntregable).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);
    vi.mocked(useArtefactosEntregable).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
  });

  it('muestra un estado de carga accesible mientras llega la primera página', () => {
    // Arrange
    mockHook({ isLoading: true });

    // Act
    render(<ConsultarEntregablesAsesor />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('muestra el error con "Reintentar" que vuelve a consultar y oculta el paginador', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ isError: true, error: new Error('fallo') });
    render(<ConsultarEntregablesAsesor />);

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
    const { rerender } = render(<ConsultarEntregablesAsesor />);

    // Assert
    expect(screen.getByText('1 entregable')).toBeInTheDocument();
    expect(
      within(screen.getByRole('table', { name: 'Entregables' })).getByText('Sistema de riego'),
    ).toBeInTheDocument();

    // Act
    mockHook({ data: crearPagina([ENTREGABLE], { totalElements: 12, totalPages: 2 }) });
    rerender(<ConsultarEntregablesAsesor />);

    // Assert
    expect(screen.getByText('12 entregables')).toBeInTheDocument();
  });

  it('los chips de estado salen del catálogo y alternar uno envía su id', async () => {
    // Arrange
    const user = userEvent.setup();
    mockCatalogo([
      { id: 'APROBADO', nombre: 'Aprobado', descripcion: '' },
      { id: 'CERRADO', nombre: 'Cerrado', descripcion: '' },
    ]);
    const hook = mockHook({ data: crearPagina([ENTREGABLE]) });
    render(<ConsultarEntregablesAsesor />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrado' }));

    // Assert
    expect(hook.toggleEstado).toHaveBeenCalledWith('CERRADO');
  });

  it('sin catálogo de estados no hay chips y el listado sigue visible', () => {
    // Arrange
    mockHook({ data: crearPagina([ENTREGABLE]) });

    // Act
    render(<ConsultarEntregablesAsesor />);

    // Assert
    expect(screen.queryByRole('button', { name: 'Cerrado' })).not.toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Entregables' })).toBeInTheDocument();
  });

  it('"Cambiar estado" abre el panel del entregable elegido y cancelar lo cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    mockCatalogo([
      { id: 'CANCELADO', nombre: 'Cancelado', descripcion: '' },
      { id: 'CERRADO', nombre: 'Cerrado', descripcion: '' },
    ]);
    mockHook({ data: crearPagina([ENTREGABLE]) });
    render(<ConsultarEntregablesAsesor />);

    // Act
    await user.click(
      within(screen.getByRole('table', { name: 'Entregables' })).getByRole('button', {
        name: /Acciones del entregable de Sistema de riego/,
      }),
    );
    await user.click(screen.getByRole('menuitem', { name: 'Cambiar estado' }));

    // Assert
    expect(screen.getByText('Cambiar estado del entregable')).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar panel' }));

    // Assert
    expect(screen.queryByText('Cambiar estado del entregable')).not.toBeInTheDocument();
  });

  it('"Ver artefactos" abre el panel del entregable elegido y cerrarlo lo quita', async () => {
    // Arrange
    const user = userEvent.setup();
    mockHook({ data: crearPagina([ENTREGABLE]) });
    render(<ConsultarEntregablesAsesor />);

    // Act
    await user.click(
      within(screen.getByRole('table', { name: 'Entregables' })).getByRole('button', {
        name: /Acciones del entregable de Sistema de riego/,
      }),
    );
    await user.click(screen.getByRole('menuitem', { name: 'Ver artefactos' }));

    // Assert
    expect(useArtefactosEntregable).toHaveBeenCalledWith('e-1');
    expect(screen.getByText('Este entregable aún no tiene artefactos')).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar panel' }));

    // Assert
    expect(screen.queryByText('Este entregable aún no tiene artefactos')).not.toBeInTheDocument();
  });
});
