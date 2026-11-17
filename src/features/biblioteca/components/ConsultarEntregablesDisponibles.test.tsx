import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import { LIMITES } from '../../../shared/validation';
import type { EntregableDisponible } from '../models/EntregableDisponible';
import { useEntregablesDisponibles } from '../hooks/useEntregablesDisponibles';
import ConsultarEntregablesDisponibles from './ConsultarEntregablesDisponibles';

vi.mock('../hooks/useEntregablesDisponibles', () => ({
  useEntregablesDisponibles: vi.fn(),
}));

const ENTREGABLE: EntregableDisponible = {
  id: 'e-1',
  proyectoGrado: 'p-1',
  tituloProyecto: 'Sistema de riego',
  versionEntregable: 2,
  nombreArchivo: 'informe-final.pdf',
  autores: [
    { id: 'a-1', identificador: 'ana', nombre: 'Ana Pérez' },
    { id: 'a-2', identificador: 'luis', nombre: 'Luis Gómez' },
  ],
};

function crearPagina(content: EntregableDisponible[]) {
  return {
    content,
    page: 0,
    size: 10,
    totalElements: content.length,
    totalPages: 1,
    first: true,
    last: true,
    empty: content.length === 0,
  } as Page<EntregableDisponible>;
}

function mockHook(parcial: Partial<ReturnType<typeof useEntregablesDisponibles>> = {}) {
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
    limpiarFiltros: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useEntregablesDisponibles>;
  vi.mocked(useEntregablesDisponibles).mockReturnValue(hook);
  return hook;
}

describe('ConsultarEntregablesDisponibles', () => {
  beforeEach(() => {
    vi.mocked(useEntregablesDisponibles).mockReset();
  });

  it('muestra cada fila con sus respaldos, el total y limita la búsqueda al máximo del título', () => {
    // Arrange
    mockHook({
      data: crearPagina([
        ENTREGABLE,
        { ...ENTREGABLE, id: 'e-2', tituloProyecto: null, autores: [] },
      ]),
    });

    // Act
    render(<ConsultarEntregablesDisponibles />);

    // Assert
    const tabla = within(screen.getByRole('table', { name: 'Entregables por registrar' }));
    expect(tabla.getByText('Sistema de riego')).toBeInTheDocument();
    expect(tabla.getByText('Sistema de riego')).toBeInTheDocument();
    expect(tabla.getAllByText('informe-final.pdf')).toHaveLength(2);
    expect(tabla.getByText('Ana Pérez y Luis Gómez')).toBeInTheDocument();
    expect(tabla.getByText('Sin título')).toBeInTheDocument();
    expect(tabla.getByText('Sin autores registrados')).toBeInTheDocument();
    expect(screen.getByText('2 entregables')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Buscar entregables' })).toHaveAttribute(
      'maxlength',
      String(LIMITES.TITULO_PROYECTO_MAX),
    );
  });

  it('sin filas ni búsqueda muestra el vacío sin acción de limpiar', () => {
    // Arrange
    mockHook({ data: crearPagina([]) });

    // Act
    render(<ConsultarEntregablesDisponibles />);

    // Assert
    expect(screen.getByText('No hay entregables por registrar')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
  });

  it('sin filas con búsqueda muestra «Sin resultados» y «Limpiar filtros» llama a limpiarFiltros', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ data: crearPagina([]), texto: 'zzz' });

    // Act
    render(<ConsultarEntregablesDisponibles />);
    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

    // Assert
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(hook.limpiarFiltros).toHaveBeenCalledTimes(1);
  });

  it('con error muestra el aviso, oculta la tabla y «Reintentar» llama a refetch', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ isError: true, error: new Error('fallo') });

    // Act
    render(<ConsultarEntregablesDisponibles />);
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar los entregables por registrar',
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(hook.refetch).toHaveBeenCalledTimes(1);
  });
});
