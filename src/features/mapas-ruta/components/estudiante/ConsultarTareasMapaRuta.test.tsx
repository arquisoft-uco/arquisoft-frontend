import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { useEstadosTarea } from '../../hooks/useEstadosTarea';
import { useTareasMapaRuta } from '../../hooks/useTareasMapaRuta';
import ConsultarTareasMapaRuta from './ConsultarTareasMapaRuta';

vi.mock('../../hooks/useTareasMapaRuta', () => ({ useTareasMapaRuta: vi.fn() }));
vi.mock('../../hooks/useEstadosTarea', () => ({ useEstadosTarea: vi.fn() }));

const useListado = vi.mocked(useTareasMapaRuta);
const useCatalogo = vi.mocked(useEstadosTarea);

const TAREA = {
  id: 't-1',
  descripcion: 'Entregar informe',
  mapaRutaId: 'm-1',
  estado: { id: 'NUEVA', nombre: 'Nueva' },
  asesor: { id: 'a-1', nombre: 'Ana Ruiz', email: 'ana@uco.edu.co' },
};

const PAGINA_VACIA = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  page: 0,
  size: 10,
  first: true,
  last: true,
  empty: true,
};

function simularListado(parcial: Partial<ReturnType<typeof useTareasMapaRuta>> = {}) {
  const base = {
    data: { content: [TAREA], totalElements: 1, totalPages: 1 },
    isLoading: false,
    isError: false,
    error: null,
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
    ordenCampo: 'descripcion',
    ordenDireccion: 'ASC',
    setOrden: vi.fn(),
    hayFiltros: false,
    limpiarFiltros: vi.fn(),
    ...parcial,
  };
  useListado.mockReturnValue(base as ReturnType<typeof useTareasMapaRuta>);
  return base;
}

function simularCatalogo(parcial: Partial<ReturnType<typeof useEstadosTarea>> = {}) {
  useCatalogo.mockReturnValue({
    data: [{ id: 'NUEVA', nombre: 'Nueva', descripcion: 'd' }],
    isError: false,
    refetch: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useEstadosTarea>);
}

describe('ConsultarTareasMapaRuta', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    simularCatalogo();
  });

  it('muestra la tarea con su estado y su asesor con correo, y consulta con el id del mapa', () => {
    // Arrange
    simularListado();

    // Act
    render(<ConsultarTareasMapaRuta mapaRutaId="m-1" />);

    // Assert
    expect(useListado).toHaveBeenCalledWith('m-1');
    expect(screen.getAllByText('Entregar informe').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ana Ruiz').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ana@uco.edu.co').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Nueva').length).toBeGreaterThan(0);
    expect(screen.getByText('1 tarea')).toBeInTheDocument();
  });

  it('mientras carga muestra el estado de carga accesible', () => {
    // Arrange
    simularListado({ data: undefined, isLoading: true });

    // Act
    render(<ConsultarTareasMapaRuta mapaRutaId="m-1" />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('sin tareas ni filtros muestra el vacío de que aún no hay tareas', () => {
    // Arrange
    simularListado({ data: PAGINA_VACIA });

    // Act
    render(<ConsultarTareasMapaRuta mapaRutaId="m-1" />);

    // Assert
    expect(screen.getByText('Aún no hay tareas')).toBeInTheDocument();
  });

  it('sin coincidencias con filtros muestra Sin resultados y Limpiar filtros los quita', async () => {
    // Arrange
    const listado = simularListado({
      data: PAGINA_VACIA,
      hayFiltros: true,
      texto: 'zzz',
    });
    const user = userEvent.setup();

    // Act
    render(<ConsultarTareasMapaRuta mapaRutaId="m-1" />);
    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

    // Assert
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(listado.limpiarFiltros).toHaveBeenCalled();
  });

  it('con error muestra el aviso y Reintentar vuelve a consultar', async () => {
    // Arrange
    const listado = simularListado({ data: undefined, isError: true });
    const user = userEvent.setup();

    // Act
    render(<ConsultarTareasMapaRuta mapaRutaId="m-1" />);
    await user.click(screen.getByRole('button', { name: /Reintentar/ }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar las tareas');
    expect(listado.refetch).toHaveBeenCalledTimes(1);
  });

  it('si falla el catálogo avisa, ofrece reintentar y mantiene la lista', async () => {
    // Arrange
    const refetch = vi.fn();
    simularListado();
    simularCatalogo({ data: undefined, isError: true, refetch });
    const user = userEvent.setup();

    // Act
    render(<ConsultarTareasMapaRuta mapaRutaId="m-1" />);
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByText('No se pudieron cargar los estados para filtrar.')).toBeInTheDocument();
    expect(screen.getAllByText('Entregar informe').length).toBeGreaterThan(0);
    expect(screen.queryByRole('group', { name: 'Estado' })).not.toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('elegir un chip de estado alterna ese estado', async () => {
    // Arrange
    const listado = simularListado();
    const user = userEvent.setup();

    // Act
    render(<ConsultarTareasMapaRuta mapaRutaId="m-1" />);
    await user.click(screen.getByRole('button', { name: 'Nueva' }));

    // Assert
    expect(listado.toggleEstado).toHaveBeenCalledWith('NUEVA');
  });
});
