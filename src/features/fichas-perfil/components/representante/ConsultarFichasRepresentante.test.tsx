import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import {
  avanzar,
  restaurarTemporizadores,
  usarTemporizadoresFalsos,
} from '../../../../test-utils/temporizadores';
import ConsultarFichasRepresentante from './ConsultarFichasRepresentante';
import { useEstadosFicha } from '../../hooks/useEstadosFicha';
import { useFichasRepresentante } from '../../hooks/useFichasRepresentante';
import type { Page } from '../../../../shared/models/api-response';
import type { FichaPerfilRepresentante } from '../../models/FichaPerfilRepresentante';

vi.mock('../../hooks/useFichasRepresentante', () => ({ useFichasRepresentante: vi.fn() }));
vi.mock('../../hooks/useEstadosFicha', () => ({ useEstadosFicha: vi.fn() }));

const ESTADOS = [
  { id: 'APROBADA', nombre: 'Aprobada', descripcion: '' },
  { id: 'NO_APROBADA', nombre: 'No Aprobada', descripcion: '' },
];

const FICHA: FichaPerfilRepresentante = {
  id: 'f-1',
  titulo: 'Sistema de monitoreo',
  asesorNombre: 'Ana Pérez',
  asesorEmail: 'ana@uco.edu.co',
  estadoId: 'APROBADA',
  estadoActual: 'Aprobada',
  estadoFechaActualizacion: '2026-10-01T15:30:00Z',
};

function crearPagina(
  content: FichaPerfilRepresentante[],
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
  } as Page<FichaPerfilRepresentante>;
}

function mockHook(parcial: Partial<ReturnType<typeof useFichasRepresentante>> = {}) {
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
    filtros: { titulo: '', asesorNombre: '', asesorEmail: '', estadoIds: [] },
    setTitulo: vi.fn(),
    setAsesorNombre: vi.fn(),
    setAsesorEmail: vi.fn(),
    toggleEstado: vi.fn(),
    limpiarEstados: vi.fn(),
    ordenCampo: 'tituloProyecto',
    ordenDireccion: 'ASC',
    setOrden: vi.fn(),
    limpiarFiltros: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useFichasRepresentante>;
  vi.mocked(useFichasRepresentante).mockReturnValue(hook);
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
  return within(screen.getByRole('table', { name: 'Fichas de perfil a evaluar' }));
}

async function abrirFiltros(user: UserEvent) {
  await user.click(screen.getByRole('button', { name: /^filtros/i }));
  return within(screen.getByRole('dialog', { name: 'Filtros' }));
}

describe('ConsultarFichasRepresentante', () => {
  beforeEach(() => {
    vi.mocked(useFichasRepresentante).mockReset();
    mockCatalogo();
  });

  afterEach(() => {
    restaurarTemporizadores();
  });

  it('muestra las fichas con asesor, estado y fecha, y el título abre el detalle', async () => {
    // Arrange
    const user = userEvent.setup();
    const onSeleccionar = vi.fn();
    mockHook({ data: crearPagina([FICHA]) });
    render(<ConsultarFichasRepresentante onSeleccionar={onSeleccionar} />);

    // Act
    await user.click(tabla().getByRole('button', { name: 'Abrir la ficha Sistema de monitoreo' }));

    // Assert
    expect(screen.getByText('1 ficha')).toBeInTheDocument();
    expect(tabla().getByText('Ana Pérez')).toBeInTheDocument();
    expect(tabla().getByText('ana@uco.edu.co')).toBeInTheDocument();
    expect(tabla().getByText('Aprobada')).toBeInTheDocument();
    expect(tabla().getByText(/2026/)).toHaveAttribute('datetime', '2026-10-01T15:30:00Z');
    expect(onSeleccionar).toHaveBeenCalledWith(FICHA);
  });

  it('los cuatro filtros llaman a su setter: título y asesor con retardo, estados al instante', async () => {
    // Arrange
    const user = usarTemporizadoresFalsos();
    const hook = mockHook({ data: crearPagina([FICHA]) });
    render(<ConsultarFichasRepresentante onSeleccionar={vi.fn()} />);

    // Act
    await user.type(screen.getByRole('textbox', { name: 'Buscar fichas' }), 'sis');
    const panel = await abrirFiltros(user);
    await user.type(panel.getByRole('textbox', { name: 'Nombre del asesor' }), 'Ana');
    await user.type(panel.getByRole('textbox', { name: 'Correo del asesor' }), 'ana@');

    // Assert
    expect(hook.setTitulo).not.toHaveBeenCalled();
    expect(hook.setAsesorNombre).not.toHaveBeenCalled();

    // Act
    avanzar(300);
    await user.click(
      within(panel.getByRole('group', { name: 'Estado' })).getByRole('button', {
        name: 'Aprobada',
      }),
    );

    // Assert
    expect(hook.setTitulo).toHaveBeenCalledWith('sis');
    expect(hook.setAsesorNombre).toHaveBeenCalledWith('Ana');
    expect(hook.setAsesorEmail).toHaveBeenCalledWith('ana@');
    expect(hook.toggleEstado).toHaveBeenCalledWith('APROBADA');
  });

  it('cada filtro aplicado aparece con su ✕ y lo quita por separado', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({
      data: crearPagina([FICHA]),
      filtros: {
        titulo: '',
        asesorNombre: 'Ana',
        asesorEmail: 'ana@',
        estadoIds: ['APROBADA', 'NO_APROBADA'],
      },
    });
    render(<ConsultarFichasRepresentante onSeleccionar={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Quitar filtro Asesor: Ana' }));
    await user.click(screen.getByRole('button', { name: 'Quitar filtro Correo: ana@' }));
    await user.click(screen.getByRole('button', { name: 'Quitar filtro Estado: No Aprobada' }));

    // Assert
    expect(hook.setAsesorNombre).toHaveBeenCalledWith('');
    expect(hook.setAsesorEmail).toHaveBeenCalledWith('');
    expect(hook.toggleEstado).toHaveBeenCalledWith('NO_APROBADA');
    expect(
      screen.getByRole('button', { name: 'Quitar filtro Estado: Aprobada' }),
    ).toBeInTheDocument();
  });

  it('"Limpiar todo" quita todos los filtros', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({
      data: crearPagina([FICHA]),
      filtros: { titulo: 'sis', asesorNombre: 'Ana', asesorEmail: '', estadoIds: [] },
    });
    render(<ConsultarFichasRepresentante onSeleccionar={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Limpiar todo' }));

    // Assert
    expect(hook.limpiarFiltros).toHaveBeenCalledTimes(1);
  });

  it('ordenar por las cabeceras Ficha y Asesor llama a setOrden con el campo', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ data: crearPagina([FICHA]) });
    render(<ConsultarFichasRepresentante onSeleccionar={vi.fn()} />);

    // Act
    await user.click(tabla().getByRole('button', { name: 'Ficha' }));
    await user.click(tabla().getByRole('button', { name: 'Asesor' }));

    // Assert
    expect(hook.setOrden).toHaveBeenNthCalledWith(1, 'tituloProyecto', 'DESC');
    expect(hook.setOrden).toHaveBeenNthCalledWith(2, 'asesorNombre', 'ASC');
  });

  it('distingue el vacío sin datos del vacío con filtros', () => {
    // Arrange
    mockHook({ data: crearPagina([]) });
    const { unmount } = render(<ConsultarFichasRepresentante onSeleccionar={vi.fn()} />);

    // Assert
    expect(screen.getByText('Aún no hay fichas para evaluar')).toBeInTheDocument();
    unmount();

    // Arrange
    mockHook({
      data: crearPagina([]),
      filtros: { titulo: 'zzz', asesorNombre: '', asesorEmail: '', estadoIds: [] },
    });

    // Act
    render(<ConsultarFichasRepresentante onSeleccionar={vi.fn()} />);

    // Assert
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
  });

  it('muestra el error con "Reintentar" que vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ isError: true, error: new Error('fallo') });
    render(<ConsultarFichasRepresentante onSeleccionar={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar las fichas de perfil',
    );
    expect(hook.refetch).toHaveBeenCalledTimes(1);
  });

  it('si el catálogo de estados falla avisa en la sección y deja los demás filtros disponibles', async () => {
    // Arrange
    const user = userEvent.setup();
    mockCatalogo({ data: undefined, isError: true });
    mockHook({ data: crearPagina([FICHA]) });
    render(<ConsultarFichasRepresentante onSeleccionar={vi.fn()} />);

    // Act
    const panel = await abrirFiltros(user);

    // Assert
    expect(panel.getByRole('note')).toHaveTextContent('No se pudo cargar la lista de estados');
    expect(panel.getByRole('textbox', { name: 'Nombre del asesor' })).toBeEnabled();
    expect(panel.getByRole('textbox', { name: 'Correo del asesor' })).toBeEnabled();
  });

  it('el paginador navega a la página siguiente', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ data: crearPagina([FICHA], { totalElements: 25, totalPages: 3 }) });
    render(<ConsultarFichasRepresentante onSeleccionar={vi.fn()} />);

    // Act
    await user.click(
      within(screen.getByRole('navigation', { name: 'Paginación' })).getByRole('button', {
        name: 'Página siguiente',
      }),
    );

    // Assert
    expect(hook.goToPage).toHaveBeenCalledWith(1);
  });
});
