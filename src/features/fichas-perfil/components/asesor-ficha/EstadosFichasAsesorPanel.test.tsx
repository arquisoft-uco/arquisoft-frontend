import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import {
  avanzar,
  restaurarTemporizadores,
  usarTemporizadoresFalsos,
} from '../../../../test-utils/temporizadores';
import EstadosFichasAsesorPanel from './EstadosFichasAsesorPanel';
import { useEstadosFichasAsesor } from '../../hooks/useEstadosFichasAsesor';
import { useEstadosFicha } from '../../hooks/useEstadosFicha';
import type { Page } from '../../../../shared/models/api-response';
import type { EstadoFichaPerfilAsesor } from '../../models/EstadoFichaPerfilAsesor';

vi.mock('../../hooks/useEstadosFichasAsesor', () => ({ useEstadosFichasAsesor: vi.fn() }));
vi.mock('../../hooks/useEstadosFicha', () => ({ useEstadosFicha: vi.fn() }));

const ESTADOS = [
  { id: 'EN_CONSTRUCCION', nombre: 'En Construccion', descripcion: '' },
  { id: 'DESCARTADA', nombre: 'Descartada', descripcion: '' },
];

const FILA: EstadoFichaPerfilAsesor = {
  fichaPerfilId: 'f-1',
  tituloProyecto: 'Sistema de monitoreo',
  estadoId: 'EN_CONSTRUCCION',
  estadoNombre: 'En Construccion',
  fechaActualizacion: '2026-10-01T15:30:00Z',
};

function crearPagina(
  content: EstadoFichaPerfilAsesor[],
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
  } as Page<EstadoFichaPerfilAsesor>;
}

function mockHook(parcial: Partial<ReturnType<typeof useEstadosFichasAsesor>> = {}) {
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
    estadoId: '',
    setEstadoId: vi.fn(),
    ordenDireccion: 'ASC',
    setOrden: vi.fn(),
    limpiarFiltros: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useEstadosFichasAsesor>;
  vi.mocked(useEstadosFichasAsesor).mockReturnValue(hook);
  return hook;
}

function mockCatalogo(parcial: Partial<ReturnType<typeof useEstadosFicha>> = {}) {
  vi.mocked(useEstadosFicha).mockReturnValue({
    data: ESTADOS,
    isLoading: false,
    isError: false,
    ...parcial,
  } as ReturnType<typeof useEstadosFicha>);
}

function tabla() {
  return within(screen.getByRole('table', { name: 'Estados de mis fichas' }));
}

async function abrirSeccionEstado(user: UserEvent) {
  await user.click(screen.getByRole('button', { name: /^filtros/i }));
  return within(screen.getByRole('group', { name: 'Estado' }));
}

describe('EstadosFichasAsesorPanel', () => {
  beforeEach(() => {
    vi.mocked(useEstadosFichasAsesor).mockReset();
    mockCatalogo();
  });

  afterEach(() => {
    restaurarTemporizadores();
  });

  it('muestra un estado de carga accesible con los filtros ya visibles', () => {
    // Arrange
    mockHook({ isLoading: true });

    // Act
    render(<EstadosFichasAsesorPanel />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando estados de mis fichas…');
    expect(screen.getByRole('textbox', { name: 'Buscar fichas' })).toBeInTheDocument();
  });

  it('muestra el error con "Reintentar" que vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ isError: true, error: new Error('fallo') });
    render(<EstadosFichasAsesorPanel />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar los estados de tus fichas',
    );
    expect(hook.refetch).toHaveBeenCalledTimes(1);
  });

  it('distingue el vacío sin datos del vacío con filtros, y este último limpia los filtros', async () => {
    // Arrange
    const user = userEvent.setup();
    mockHook({ data: crearPagina([]) });
    const { unmount } = render(<EstadosFichasAsesorPanel />);

    // Assert
    expect(screen.getByText('Aún no hay estados registrados')).toBeInTheDocument();
    unmount();

    // Arrange
    const hook = mockHook({ data: crearPagina([]), texto: 'zzz' });
    render(<EstadosFichasAsesorPanel />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

    // Assert
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(hook.limpiarFiltros).toHaveBeenCalledTimes(1);
  });

  it('muestra la ficha, el estado en una insignia y la fecha en una etiqueta time', () => {
    // Arrange
    mockHook({ data: crearPagina([FILA]) });

    // Act
    render(<EstadosFichasAsesorPanel />);

    // Assert
    expect(tabla().getByText('En Construccion')).toBeInTheDocument();
    expect(tabla().getByText(/2026/)).toHaveAttribute('datetime', '2026-10-01T15:30:00Z');
    expect(screen.getByText('1 registro')).toBeInTheDocument();
    expect(
      tabla().getByRole('link', { name: 'Abrir la ficha Sistema de monitoreo' }),
    ).toHaveAttribute('href', '/fichas-perfil/f-1/items');
  });

  it('la búsqueda llama a setTexto tras el retardo y la sección Estado filtra al instante', async () => {
    // Arrange
    const user = usarTemporizadoresFalsos();
    const hook = mockHook({ data: crearPagina([FILA]) });
    render(<EstadosFichasAsesorPanel />);

    // Act
    await user.type(screen.getByRole('textbox', { name: 'Buscar fichas' }), 'sis');

    // Assert
    expect(hook.setTexto).not.toHaveBeenCalled();

    // Act
    avanzar(300);
    const estado = await abrirSeccionEstado(user);
    await user.click(estado.getByRole('button', { name: 'Descartada' }));

    // Assert
    expect(hook.setTexto).toHaveBeenCalledWith('sis');
    expect(hook.setEstadoId).toHaveBeenCalledWith('DESCARTADA');
  });

  it('un estado aplicado aparece con su ✕ y "Limpiar todo" quita los filtros', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ data: crearPagina([FILA]), estadoId: 'DESCARTADA', texto: 'sis' });
    render(<EstadosFichasAsesorPanel />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Quitar filtro Estado: Descartada' }));
    await user.click(screen.getByRole('button', { name: 'Limpiar todo' }));

    // Assert
    expect(hook.setEstadoId).toHaveBeenCalledWith('');
    expect(hook.limpiarFiltros).toHaveBeenCalledTimes(1);
  });

  it('ordenar por la cabecera Ficha llama a setOrden con la dirección que sigue', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ data: crearPagina([FILA]) });
    render(<EstadosFichasAsesorPanel />);

    // Act
    await user.click(tabla().getByRole('button', { name: 'Ficha' }));

    // Assert
    expect(hook.setOrden).toHaveBeenCalledWith('DESC');
  });

  it('el paginador navega a la página siguiente', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ data: crearPagina([FILA], { totalElements: 25, totalPages: 3 }) });
    render(<EstadosFichasAsesorPanel />);

    // Act
    await user.click(
      within(screen.getByRole('navigation', { name: 'Paginación' })).getByRole('button', {
        name: 'Página siguiente',
      }),
    );

    // Assert
    expect(hook.goToPage).toHaveBeenCalledWith(1);
  });

  it('si el catálogo de estados falla muestra un aviso en la sección y la lista sigue funcionando', async () => {
    // Arrange
    const user = userEvent.setup();
    mockCatalogo({ data: undefined, isError: true });
    mockHook({ data: crearPagina([FILA]) });
    render(<EstadosFichasAsesorPanel />);

    // Act
    const estado = await abrirSeccionEstado(user);

    // Assert
    expect(estado.getByRole('button', { name: 'Todos' })).toBeDisabled();
    expect(screen.getByRole('note')).toHaveTextContent('No se pudo cargar la lista de estados');
    expect(tabla().getByText('Sistema de monitoreo')).toBeInTheDocument();
  });
});
