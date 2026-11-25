import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { useLocation } from 'react-router';
import { render, screen, within } from '../../../../test-utils/render';
import {
  avanzar,
  restaurarTemporizadores,
  usarTemporizadoresFalsos,
} from '../../../../test-utils/temporizadores';
import ConsultarFichasDisponibles from './ConsultarFichasDisponibles';
import { useFichasDisponibles } from '../../hooks/useFichasDisponibles';
import type { Page } from '../../../../shared/models/api-response';
import type { FichaDisponibleEvaluacion } from '../../models/FichaDisponibleEvaluacion';

vi.mock('../../hooks/useFichasDisponibles', () => ({ useFichasDisponibles: vi.fn() }));

const FICHA: FichaDisponibleEvaluacion = {
  id: 'f-1',
  titulo: 'Sistema de monitoreo',
  asesorNombre: 'Ana Pérez',
  asesorEmail: 'ana@uco.edu.co',
  estadoId: 'DISPONIBLE_PARA_EVALUACION',
  estadoActual: 'Disponible para evaluación',
  estadoFechaActualizacion: '2026-10-01T15:30:00Z',
};

function crearPagina(
  content: FichaDisponibleEvaluacion[],
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
  } as Page<FichaDisponibleEvaluacion>;
}

function mockHook(parcial: Partial<ReturnType<typeof useFichasDisponibles>> = {}) {
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
    filtros: { titulo: '', asesorNombre: '', asesorEmail: '' },
    setTitulo: vi.fn(),
    setAsesorNombre: vi.fn(),
    setAsesorEmail: vi.fn(),
    ordenCampo: 'tituloProyecto',
    ordenDireccion: 'ASC',
    setOrden: vi.fn(),
    limpiarFiltros: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useFichasDisponibles>;
  vi.mocked(useFichasDisponibles).mockReturnValue(hook);
  return hook;
}

function EstadoDeNavegacion() {
  const { pathname, state } = useLocation();
  return <p>{`destino:${pathname}:${JSON.stringify(state)}`}</p>;
}

function tabla() {
  return within(screen.getByRole('table', { name: 'Fichas de perfil disponibles para evaluar' }));
}

async function abrirFiltros(user: UserEvent) {
  await user.click(screen.getByRole('button', { name: /^filtros/i }));
  return within(screen.getByRole('dialog', { name: 'Filtros' }));
}

describe('ConsultarFichasDisponibles', () => {
  beforeEach(() => {
    vi.mocked(useFichasDisponibles).mockReset();
  });

  afterEach(() => {
    restaurarTemporizadores();
  });

  it('muestra las fichas con asesor, estado y fecha, y el título enlaza al detalle con el resumen', async () => {
    // Arrange
    const user = userEvent.setup();
    mockHook({ data: crearPagina([FICHA]) });
    render(
      <>
        <ConsultarFichasDisponibles />
        <EstadoDeNavegacion />
      </>,
      { initialPath: '/fichas-perfil?q=sis' },
    );

    // Act
    await user.click(tabla().getByRole('link', { name: 'Abrir la ficha Sistema de monitoreo' }));

    // Assert
    expect(screen.getByText('1 ficha')).toBeInTheDocument();
    expect(tabla().getByText('Ana Pérez')).toBeInTheDocument();
    expect(tabla().getByText('ana@uco.edu.co')).toBeInTheDocument();
    expect(tabla().getByText('Disponible para evaluación')).toBeInTheDocument();
    expect(tabla().getByText(/2026/)).toHaveAttribute('datetime', '2026-10-01T15:30:00Z');
    expect(
      screen.getByText(
        'destino:/fichas-perfil/f-1/items:' +
          JSON.stringify({
            resumen: {
              id: 'f-1',
              titulo: 'Sistema de monitoreo',
              asesorNombre: 'Ana Pérez',
              asesorEmail: 'ana@uco.edu.co',
              estadoId: 'DISPONIBLE_PARA_EVALUACION',
              estadoNombre: 'Disponible para evaluación',
              fechaActualizacion: '2026-10-01T15:30:00Z',
            },
            search: '?q=sis',
          }),
      ),
    ).toBeInTheDocument();
  });

  it('los tres filtros llaman a su setter con retardo y la barra no ofrece «Estado»', async () => {
    // Arrange
    const user = usarTemporizadoresFalsos();
    const hook = mockHook({ data: crearPagina([FICHA]) });
    render(<ConsultarFichasDisponibles />);

    // Act
    await user.type(screen.getByRole('textbox', { name: 'Buscar fichas' }), 'sis');
    const panel = await abrirFiltros(user);
    await user.type(panel.getByRole('textbox', { name: 'Nombre del asesor' }), 'Ana');
    await user.type(panel.getByRole('textbox', { name: 'Correo del asesor' }), 'ana@');

    // Assert
    expect(hook.setTitulo).not.toHaveBeenCalled();
    expect(hook.setAsesorNombre).not.toHaveBeenCalled();
    expect(panel.queryByRole('group', { name: 'Estado' })).not.toBeInTheDocument();

    // Act
    avanzar(300);

    // Assert
    expect(hook.setTitulo).toHaveBeenCalledWith('sis');
    expect(hook.setAsesorNombre).toHaveBeenCalledWith('Ana');
    expect(hook.setAsesorEmail).toHaveBeenCalledWith('ana@');
  });

  it('cada filtro aplicado aparece con su ✕ y lo quita por separado', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({
      data: crearPagina([FICHA]),
      filtros: { titulo: '', asesorNombre: 'Ana', asesorEmail: 'ana@' },
    });
    render(<ConsultarFichasDisponibles />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Quitar filtro Asesor: Ana' }));
    await user.click(screen.getByRole('button', { name: 'Quitar filtro Correo: ana@' }));

    // Assert
    expect(hook.setAsesorNombre).toHaveBeenCalledWith('');
    expect(hook.setAsesorEmail).toHaveBeenCalledWith('');
  });

  it('"Limpiar todo" quita todos los filtros', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({
      data: crearPagina([FICHA]),
      filtros: { titulo: 'sis', asesorNombre: 'Ana', asesorEmail: '' },
    });
    render(<ConsultarFichasDisponibles />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Limpiar todo' }));

    // Assert
    expect(hook.limpiarFiltros).toHaveBeenCalledTimes(1);
  });

  it('ordenar por las cabeceras Ficha y Asesor llama a setOrden con el campo', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ data: crearPagina([FICHA]) });
    render(<ConsultarFichasDisponibles />);

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
    const { unmount } = render(<ConsultarFichasDisponibles />);

    // Assert
    expect(screen.getByText('No hay fichas disponibles para evaluar')).toBeInTheDocument();
    unmount();

    // Arrange
    mockHook({
      data: crearPagina([]),
      filtros: { titulo: 'zzz', asesorNombre: '', asesorEmail: '' },
    });

    // Act
    render(<ConsultarFichasDisponibles />);

    // Assert
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
  });

  it('muestra el error con "Reintentar" que vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ isError: true, error: new Error('fallo') });
    render(<ConsultarFichasDisponibles />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar las fichas disponibles',
    );
    expect(hook.refetch).toHaveBeenCalledTimes(1);
  });

  it('el paginador navega a la página siguiente', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ data: crearPagina([FICHA], { totalElements: 25, totalPages: 3 }) });
    render(<ConsultarFichasDisponibles />);

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
