import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../test-utils/render';
import ConsultarDocumentaciones from './ConsultarDocumentaciones';
import { useDocumentaciones } from '../hooks/useDocumentaciones';
import { useEstadosDocumentacion } from '../hooks/useEstadosDocumentacion';
import type { Page } from '../../../shared/models/api-response';
import type { Documentacion } from '../models/Documentacion';

vi.mock('../hooks/useDocumentaciones', () => ({
  useDocumentaciones: vi.fn(),
}));
vi.mock('../hooks/useEstadosDocumentacion', () => ({
  useEstadosDocumentacion: vi.fn(),
}));

const DOCUMENTACION: Documentacion = {
  id: 'd-1',
  fechaPublicacion: '2026-11-01T10:00:00Z',
  entregableProyectoGrado: { id: 'e-1', versionEntregable: 2 },
  bibliotecario: { id: 'b-1', nombre: 'Laura Gómez' },
  estadoDocumentacion: { id: 'PUBLICADO', nombre: 'Publicado' },
};

function crearPagina(
  content: Documentacion[],
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
  } as Page<Documentacion>;
}

function mockHook(parcial: Partial<ReturnType<typeof useDocumentaciones>> = {}) {
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
    estadoIds: [],
    toggleEstado: vi.fn(),
    limpiarEstados: vi.fn(),
    ordenDireccion: 'DESC',
    setOrden: vi.fn(),
    limpiarFiltros: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useDocumentaciones>;
  vi.mocked(useDocumentaciones).mockReturnValue(hook);
  return hook;
}

function mockCatalogo(data?: { id: string; nombre: string; descripcion: string }[]) {
  vi.mocked(useEstadosDocumentacion).mockReturnValue({
    data,
  } as ReturnType<typeof useEstadosDocumentacion>);
}

describe('ConsultarDocumentaciones', () => {
  beforeEach(() => {
    vi.mocked(useDocumentaciones).mockReset();
    vi.mocked(useEstadosDocumentacion).mockReset();
    mockCatalogo(undefined);
  });

  it('muestra un estado de carga accesible mientras llega la primera página', () => {
    // Arrange
    mockHook({ isLoading: true });

    // Act
    render(<ConsultarDocumentaciones puedeFiltrarPorEstado={false} />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('muestra el error con "Reintentar" que vuelve a consultar y oculta el paginador', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ isError: true, error: new Error('fallo') });
    render(<ConsultarDocumentaciones puedeFiltrarPorEstado={false} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar las documentaciones',
    );
    expect(hook.refetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('navigation', { name: 'Paginación' })).not.toBeInTheDocument();
  });

  it('resume el total con singular y plural y lista las documentaciones', () => {
    // Arrange
    mockHook({ data: crearPagina([DOCUMENTACION]) });
    const { rerender } = render(<ConsultarDocumentaciones puedeFiltrarPorEstado={false} />);

    // Assert
    expect(screen.getByText('1 documentación')).toBeInTheDocument();
    expect(
      within(screen.getByRole('table', { name: 'Documentaciones' })).getByText('Laura Gómez'),
    ).toBeInTheDocument();

    // Act
    mockHook({ data: crearPagina([DOCUMENTACION], { totalElements: 12, totalPages: 2 }) });
    rerender(<ConsultarDocumentaciones puedeFiltrarPorEstado={false} />);

    // Assert
    expect(screen.getByText('12 documentaciones')).toBeInTheDocument();
  });

  it('con permiso los chips salen del catálogo y alternar uno envía su id', async () => {
    // Arrange
    const user = userEvent.setup();
    mockCatalogo([
      { id: 'PENDIENTE', nombre: 'Pendiente', descripcion: '' },
      { id: 'PUBLICADO', nombre: 'Publicado', descripcion: '' },
    ]);
    const hook = mockHook({ data: crearPagina([DOCUMENTACION]) });
    render(<ConsultarDocumentaciones puedeFiltrarPorEstado />);

    // Act
    await user.click(
      within(screen.getByRole('group', { name: 'Estado' })).getByRole('button', {
        name: 'Pendiente',
      }),
    );

    // Assert
    expect(hook.toggleEstado).toHaveBeenCalledWith('PENDIENTE');
    expect(useEstadosDocumentacion).toHaveBeenCalledWith(true);
  });

  it('sin permiso no hay barra de filtros aunque haya catálogo y no se habilita su consulta', () => {
    // Arrange
    mockCatalogo([{ id: 'PENDIENTE', nombre: 'Pendiente', descripcion: '' }]);
    mockHook({ data: crearPagina([DOCUMENTACION]) });

    // Act
    render(<ConsultarDocumentaciones puedeFiltrarPorEstado={false} />);

    // Assert
    expect(screen.queryByRole('group', { name: 'Estado' })).not.toBeInTheDocument();
    expect(useEstadosDocumentacion).toHaveBeenCalledWith(false);
  });
});
