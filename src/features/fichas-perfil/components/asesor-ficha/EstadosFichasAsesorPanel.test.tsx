import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import EstadosFichasAsesorPanel from './EstadosFichasAsesorPanel';
import { useEstadosFichasAsesor } from '../../hooks/useEstadosFichasAsesor';
import { useEstadosFicha } from '../../hooks/useEstadosFicha';
import type { Page } from '../../../../shared/models/api-response';
import type { EstadoFichaPerfilAsesor } from '../../models/EstadoFichaPerfilAsesor';
import type { EstadoFicha } from '../../models/fichas-perfil';

vi.mock('../../hooks/useEstadosFichasAsesor', () => ({
  useEstadosFichasAsesor: vi.fn(),
}));

vi.mock('../../hooks/useEstadosFicha', () => ({
  useEstadosFicha: vi.fn(),
}));

type HookEstados = ReturnType<typeof useEstadosFichasAsesor>;
type HookCatalogo = ReturnType<typeof useEstadosFicha>;

function crearHookMock(parcial: Partial<HookEstados> = {}): HookEstados {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    page: 0,
    pageSize: 10,
    goToPage: vi.fn(),
    estadoId: '',
    titulo: '',
    aplicarFiltros: vi.fn(),
    ...parcial,
  } as unknown as HookEstados;
}

function crearCatalogoMock(parcial: Partial<HookCatalogo> = {}): HookCatalogo {
  return {
    data: CATALOGO,
    isLoading: false,
    isError: false,
    ...parcial,
  } as unknown as HookCatalogo;
}

function crearPagina(
  content: EstadoFichaPerfilAsesor[],
  extra: Partial<Page<EstadoFichaPerfilAsesor>> = {},
): Page<EstadoFichaPerfilAsesor> {
  return {
    content,
    page: 0,
    size: 10,
    totalElements: content.length,
    totalPages: content.length === 0 ? 0 : 1,
    first: true,
    last: true,
    empty: content.length === 0,
    ...extra,
  };
}

const CATALOGO: EstadoFicha[] = [
  { id: 'st-1', nombre: 'En revisión', descripcion: '' },
  { id: 'st-2', nombre: 'Aprobada', descripcion: '' },
];

const FILA_1: EstadoFichaPerfilAsesor = {
  fichaPerfilId: 'f-1',
  tituloProyecto: 'Sistema de monitoreo',
  estadoId: 'st-1',
  estadoNombre: 'En revisión',
  fechaActualizacion: '2026-09-01T10:00:00',
};

const FILA_2: EstadoFichaPerfilAsesor = {
  fichaPerfilId: 'f-1',
  tituloProyecto: 'Sistema de monitoreo',
  estadoId: 'st-2',
  estadoNombre: 'Aprobada',
  fechaActualizacion: '2026-09-15T08:30:00',
};

describe('EstadosFichasAsesorPanel', () => {
  beforeEach(() => {
    vi.mocked(useEstadosFichasAsesor).mockReset();
    vi.mocked(useEstadosFicha).mockReset();
    vi.mocked(useEstadosFicha).mockReturnValue(crearCatalogoMock());
  });

  it('muestra el spinner accesible mientras carga y mantiene visibles los filtros', () => {
    // Arrange
    vi.mocked(useEstadosFichasAsesor).mockReturnValue(crearHookMock({ isLoading: true }));

    // Act
    render(<EstadosFichasAsesorPanel />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando estados de las fichas');
    expect(screen.getByRole('button', { name: 'Filtrar' })).toBeInTheDocument();
  });

  it('muestra el mensaje del backend en un alert y reintenta con refetch', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(useEstadosFichasAsesor).mockReturnValue(
      crearHookMock({ isError: true, error: new Error('fallo'), refetch }),
    );
    render(<EstadosFichasAsesorPanel />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar los estados de las fichas.',
    );
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('sin filtros y sin filas explica que las fichas aún no tienen estados, sin tratarlo como error', () => {
    // Arrange
    vi.mocked(useEstadosFichasAsesor).mockReturnValue(crearHookMock({ data: crearPagina([]) }));

    // Act
    render(<EstadosFichasAsesorPanel />);

    // Assert
    expect(screen.getByText('Tus fichas aún no tienen estados registrados.')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('con filtros aplicados y sin filas indica que no hay coincidencias', () => {
    // Arrange
    vi.mocked(useEstadosFichasAsesor).mockReturnValue(
      crearHookMock({ data: crearPagina([]), estadoId: 'st-1' }),
    );

    // Act
    render(<EstadosFichasAsesorPanel />);

    // Assert
    expect(screen.getByText('No hay estados que coincidan con los filtros.')).toBeInTheDocument();
  });

  it('con datos renderiza una fila por transición con título, estado y fecha en es-CO', () => {
    // Arrange
    vi.mocked(useEstadosFichasAsesor).mockReturnValue(
      crearHookMock({ data: crearPagina([FILA_1, FILA_2]) }),
    );
    const formato = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

    // Act
    render(<EstadosFichasAsesorPanel />);

    // Assert
    const tabla = screen.getByRole('table', {
      name: 'Estados de las fichas de perfil que asesora',
    });
    expect(tabla).toBeInTheDocument();
    expect(screen.getAllByRole('cell', { name: 'Sistema de monitoreo' })).toHaveLength(2);
    expect(screen.getByRole('cell', { name: 'En revisión' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Aprobada' })).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: formato.format(new Date(FILA_1.fechaActualizacion)) }),
    ).toBeInTheDocument();
  });

  it('al enviar el formulario aplica el estado elegido y el título escrito', async () => {
    // Arrange
    const user = userEvent.setup();
    const aplicarFiltros = vi.fn();
    vi.mocked(useEstadosFichasAsesor).mockReturnValue(
      crearHookMock({ data: crearPagina([FILA_1]), aplicarFiltros }),
    );
    render(<EstadosFichasAsesorPanel />);

    // Act
    await user.selectOptions(screen.getByLabelText('Estado'), 'st-2');
    await user.type(screen.getByLabelText('Título de la ficha'), 'monitoreo');
    await user.click(screen.getByRole('button', { name: 'Filtrar' }));

    // Assert
    expect(aplicarFiltros).toHaveBeenCalledWith('st-2', 'monitoreo');
  });

  it('Limpiar vacía los campos y aplica filtros vacíos', async () => {
    // Arrange
    const user = userEvent.setup();
    const aplicarFiltros = vi.fn();
    vi.mocked(useEstadosFichasAsesor).mockReturnValue(
      crearHookMock({
        data: crearPagina([FILA_1]),
        aplicarFiltros,
        estadoId: 'st-1',
        titulo: 'monitoreo',
      }),
    );
    render(<EstadosFichasAsesorPanel />);
    expect(screen.getByLabelText('Título de la ficha')).toHaveValue('monitoreo');

    // Act
    await user.click(screen.getByRole('button', { name: 'Limpiar' }));

    // Assert
    expect(aplicarFiltros).toHaveBeenCalledWith('', '');
    expect(screen.getByLabelText('Título de la ficha')).toHaveValue('');
    expect(screen.getByLabelText('Estado')).toHaveValue('');
  });

  it('el paginador aparece solo con más de una página y avanza con goToPage', async () => {
    // Arrange
    const user = userEvent.setup();
    const goToPage = vi.fn();
    vi.mocked(useEstadosFichasAsesor).mockReturnValue(
      crearHookMock({ data: crearPagina([FILA_1]), goToPage }),
    );
    const { unmount } = render(<EstadosFichasAsesorPanel />);
    expect(screen.queryByRole('button', { name: 'Página siguiente' })).not.toBeInTheDocument();
    unmount();
    vi.mocked(useEstadosFichasAsesor).mockReturnValue(
      crearHookMock({
        data: crearPagina([FILA_1], { totalPages: 2, totalElements: 11 }),
        goToPage,
      }),
    );
    render(<EstadosFichasAsesorPanel />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Página siguiente' }));

    // Assert
    expect(screen.getByText('1–1 de 11 estados')).toBeInTheDocument();
    expect(goToPage).toHaveBeenCalledWith(1);
  });

  it('deshabilita el select de estado si el catálogo falla, pero la lista sigue funcionando', () => {
    // Arrange
    vi.mocked(useEstadosFicha).mockReturnValue(
      crearCatalogoMock({ data: undefined, isError: true }),
    );
    vi.mocked(useEstadosFichasAsesor).mockReturnValue(
      crearHookMock({ data: crearPagina([FILA_1]) }),
    );

    // Act
    render(<EstadosFichasAsesorPanel />);

    // Assert
    expect(screen.getByLabelText('Estado')).toBeDisabled();
    expect(screen.getByRole('cell', { name: 'En revisión' })).toBeInTheDocument();
  });
});
