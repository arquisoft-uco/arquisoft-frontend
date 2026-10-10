import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import {
  avanzar,
  restaurarTemporizadores,
  usarTemporizadoresFalsos,
} from '../../../../test-utils/temporizadores';
import ConsultarFichasPerfilCoordinador from './ConsultarFichasPerfilCoordinador';
import { useFichasPerfilCoordinador } from '../../hooks/useFichasPerfilCoordinador';
import type { Page } from '../../../../shared/models/api-response';
import type { FichaPerfil } from '../../models/FichaPerfil';

vi.mock('../../hooks/useFichasPerfilCoordinador', () => ({ useFichasPerfilCoordinador: vi.fn() }));

const FICHA: FichaPerfil = {
  id: 'f-1',
  tituloProyecto: 'Sistema de monitoreo',
  asesorFicha: { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
  estado: { id: 'e-1', nombre: 'En revisión', fechaActualizacion: '2026-10-01T15:30:00' },
};

function crearPagina(
  content: FichaPerfil[],
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
  } as Page<FichaPerfil>;
}

function crearHookMock(parcial: Partial<ReturnType<typeof useFichasPerfilCoordinador>> = {}) {
  return {
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
    ordenCampo: 'tituloProyecto',
    ordenDireccion: 'ASC',
    setOrden: vi.fn(),
    limpiarFiltros: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useFichasPerfilCoordinador>;
}

function mockHook(parcial: Partial<ReturnType<typeof useFichasPerfilCoordinador>> = {}) {
  const hook = crearHookMock(parcial);
  vi.mocked(useFichasPerfilCoordinador).mockReturnValue(hook);
  return hook;
}

function tabla() {
  return within(screen.getByRole('table', { name: 'Fichas de perfil' }));
}

describe('ConsultarFichasPerfilCoordinador', () => {
  beforeEach(() => {
    vi.mocked(useFichasPerfilCoordinador).mockReset();
  });

  afterEach(() => {
    restaurarTemporizadores();
  });

  it('muestra un estado de carga accesible mientras llega la primera página', () => {
    // Arrange
    mockHook({ isLoading: true });

    // Act
    render(<ConsultarFichasPerfilCoordinador />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando fichas de perfil…');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('muestra el error con "Reintentar" que vuelve a consultar y oculta el paginador', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ isError: true, error: new Error('fallo') });
    render(<ConsultarFichasPerfilCoordinador />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar las fichas de perfil',
    );
    expect(hook.refetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('navigation', { name: 'Paginación' })).not.toBeInTheDocument();
  });

  it('resume el total con singular y plural y lista las fichas', () => {
    // Arrange
    mockHook({ data: crearPagina([FICHA]) });
    const { rerender } = render(<ConsultarFichasPerfilCoordinador />);

    // Assert
    expect(screen.getByText('1 ficha')).toBeInTheDocument();
    expect(tabla().getByText('Sistema de monitoreo')).toBeInTheDocument();

    // Act
    mockHook({ data: crearPagina([FICHA], { totalElements: 12, totalPages: 2 }) });
    rerender(<ConsultarFichasPerfilCoordinador />);

    // Assert
    expect(screen.getByText('12 fichas')).toBeInTheDocument();
  });

  it('la búsqueda por título llama a setTexto solo tras el retardo de 300 ms', async () => {
    // Arrange
    const user = usarTemporizadoresFalsos();
    const hook = mockHook({ data: crearPagina([FICHA]) });
    render(<ConsultarFichasPerfilCoordinador />);

    // Act
    await user.type(screen.getByRole('textbox', { name: 'Buscar fichas' }), 'monitoreo');

    // Assert
    expect(hook.setTexto).not.toHaveBeenCalled();

    // Act
    avanzar(300);

    // Assert
    expect(hook.setTexto).toHaveBeenCalledWith('monitoreo');
  });

  it('sin resultados con búsqueda activa "Limpiar filtros" quita la búsqueda', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ data: crearPagina([]), texto: 'zzz' });
    render(<ConsultarFichasPerfilCoordinador />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

    // Assert
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(hook.limpiarFiltros).toHaveBeenCalledTimes(1);
  });

  it('el paginador navega a la página siguiente y a la última', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({
      data: crearPagina([FICHA], { totalElements: 30, totalPages: 3 }),
    });
    render(<ConsultarFichasPerfilCoordinador />);
    const paginador = within(screen.getByRole('navigation', { name: 'Paginación' }));

    // Act
    await user.click(paginador.getByRole('button', { name: 'Página siguiente' }));
    await user.click(paginador.getByRole('button', { name: 'Página 3' }));

    // Assert
    expect(hook.goToPage).toHaveBeenNthCalledWith(1, 1);
    expect(hook.goToPage).toHaveBeenNthCalledWith(2, 2);
  });

  it('ordenar por una cabecera llama a setOrden con el campo y la dirección', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ data: crearPagina([FICHA]) });
    render(<ConsultarFichasPerfilCoordinador />);

    // Act
    await user.click(tabla().getByRole('button', { name: 'Asesor' }));

    // Assert
    expect(hook.setOrden).toHaveBeenCalledWith('asesorNombre', 'ASC');
  });
});
