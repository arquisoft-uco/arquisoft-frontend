import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import ConsultarProyectosGradoCoordinador from './ConsultarProyectosGradoCoordinador';
import { useProyectosGradoCoordinador } from '../../hooks/useProyectosGradoCoordinador';
import type { Page } from '../../../../shared/models/api-response';
import type { ProyectoGrado } from '../../models/ProyectoGrado';

vi.mock('../../hooks/useProyectosGradoCoordinador', () => ({
  useProyectosGradoCoordinador: vi.fn(),
}));

const PROYECTO: ProyectoGrado = {
  id: 'p-1',
  fichaPerfil: 'f-1',
  tituloProyecto: 'Sistema de monitoreo',
  estado: { id: 'EN_PROCESO', nombre: 'En proceso' },
};

function crearPagina(
  content: ProyectoGrado[],
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
  } as Page<ProyectoGrado>;
}

function mockHook(parcial: Partial<ReturnType<typeof useProyectosGradoCoordinador>> = {}) {
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
    ordenCampo: 'tituloProyecto',
    ordenDireccion: 'ASC',
    setOrden: vi.fn(),
    limpiarFiltros: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useProyectosGradoCoordinador>;
  vi.mocked(useProyectosGradoCoordinador).mockReturnValue(hook);
  return hook;
}

describe('ConsultarProyectosGradoCoordinador', () => {
  beforeEach(() => {
    vi.mocked(useProyectosGradoCoordinador).mockReset();
  });

  it('muestra un estado de carga accesible mientras llega la primera página', () => {
    // Arrange
    mockHook({ isLoading: true });

    // Act
    render(<ConsultarProyectosGradoCoordinador />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('muestra el error con "Reintentar" que vuelve a consultar y oculta el paginador', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ isError: true, error: new Error('fallo') });
    render(<ConsultarProyectosGradoCoordinador />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar los proyectos de grado',
    );
    expect(hook.refetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('navigation', { name: 'Paginación' })).not.toBeInTheDocument();
  });

  it('resume el total con singular y plural y lista los proyectos', () => {
    // Arrange
    mockHook({ data: crearPagina([PROYECTO]) });
    const { rerender } = render(<ConsultarProyectosGradoCoordinador />);

    // Assert
    expect(screen.getByText('1 proyecto')).toBeInTheDocument();
    expect(
      within(screen.getByRole('table', { name: 'Proyectos de grado' })).getByText(
        'Sistema de monitoreo',
      ),
    ).toBeInTheDocument();

    // Act
    mockHook({ data: crearPagina([PROYECTO], { totalElements: 12, totalPages: 2 }) });
    rerender(<ConsultarProyectosGradoCoordinador />);

    // Assert
    expect(screen.getByText('12 proyectos')).toBeInTheDocument();
  });

  it('los chips de estado fijos alternan el id elegido', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ data: crearPagina([PROYECTO]) });
    render(<ConsultarProyectosGradoCoordinador />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Listo Para Revisión' }));

    // Assert
    expect(screen.getByRole('button', { name: 'Finalizado' })).toBeInTheDocument();
    expect(hook.toggleEstado).toHaveBeenCalledWith('LISTO_PARA_REVISION');
  });
});
