import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import ConsultarEntregablesEstudiante from './ConsultarEntregablesEstudiante';
import { useEntregablesEstudiante } from '../../hooks/useEntregablesEstudiante';
import type { Page } from '../../../../shared/models/api-response';
import type { EntregableProyectoGrado } from '../../models/EntregableProyectoGrado';

vi.mock('../../hooks/useEntregablesEstudiante', () => ({
  useEntregablesEstudiante: vi.fn(),
}));

const ENTREGABLE: EntregableProyectoGrado = {
  id: 'e-1',
  versionEntregable: 1,
  proyectoGrado: { id: 'p-1', nombre: 'Sistema de riego' },
  asesor: { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
  estadoEntregable: { id: 'APROBADO', nombre: 'Aprobado' },
};

function crearPagina(totalElements: number, totalPages = 1) {
  return {
    content: [ENTREGABLE],
    page: 0,
    size: 10,
    totalElements,
    totalPages,
    first: true,
    last: totalPages <= 1,
    empty: false,
  } as Page<EntregableProyectoGrado>;
}

function mockHook(parcial: Partial<ReturnType<typeof useEntregablesEstudiante>> = {}) {
  const hook = {
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
    page: 0,
    pageSize: 10,
    goToPage: vi.fn(),
    ordenCampo: 'versionEntregable',
    ordenDireccion: 'DESC',
    setOrden: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useEntregablesEstudiante>;
  vi.mocked(useEntregablesEstudiante).mockReturnValue(hook);
  return hook;
}

describe('ConsultarEntregablesEstudiante', () => {
  beforeEach(() => {
    vi.mocked(useEntregablesEstudiante).mockReset();
  });

  it('muestra un estado de carga accesible mientras llega la primera página', () => {
    // Arrange
    mockHook({ isLoading: true });

    // Act
    render(<ConsultarEntregablesEstudiante proyectoGradoId="p-1" />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('muestra el error con "Reintentar" que vuelve a consultar y oculta el paginador', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ isError: true, error: new Error('fallo') });
    render(<ConsultarEntregablesEstudiante proyectoGradoId="p-1" />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar los entregables');
    expect(hook.refetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('navigation', { name: 'Paginación' })).not.toBeInTheDocument();
  });

  it('resume el total con singular y plural y consulta el proyecto recibido', () => {
    // Arrange
    mockHook({ data: crearPagina(1) });
    const { rerender } = render(<ConsultarEntregablesEstudiante proyectoGradoId="p-1" />);

    // Assert
    expect(vi.mocked(useEntregablesEstudiante)).toHaveBeenCalledWith('p-1');
    expect(screen.getByText('1 entregable')).toBeInTheDocument();
    expect(
      within(screen.getByRole('table', { name: 'Entregables' })).getByText('Ana Pérez'),
    ).toBeInTheDocument();

    // Act
    mockHook({ data: crearPagina(12, 2) });
    rerender(<ConsultarEntregablesEstudiante proyectoGradoId="p-1" />);

    // Assert
    expect(screen.getByText('12 entregables')).toBeInTheDocument();
  });
});
