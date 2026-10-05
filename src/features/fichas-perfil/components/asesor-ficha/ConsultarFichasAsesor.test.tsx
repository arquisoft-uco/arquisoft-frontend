import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import ConsultarFichasAsesor from './ConsultarFichasAsesor';
import { useFichasAsesor } from '../../hooks/useFichasAsesor';
import type { Page } from '../../../../shared/models/api-response';
import type { FichaPerfil } from '../../models/FichaPerfil';

vi.mock('../../hooks/useFichasAsesor', () => ({ useFichasAsesor: vi.fn() }));

const FICHA: FichaPerfil = {
  id: 'f-1',
  tituloProyecto: 'Sistema de monitoreo',
  asesorFicha: { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
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

function mockHook(parcial: Partial<ReturnType<typeof useFichasAsesor>> = {}) {
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
    ...parcial,
  } as ReturnType<typeof useFichasAsesor>;
  vi.mocked(useFichasAsesor).mockReturnValue(hook);
  return hook;
}

function tabla() {
  return within(screen.getByRole('table', { name: 'Fichas de perfil que asesoras' }));
}

describe('ConsultarFichasAsesor', () => {
  beforeEach(() => {
    vi.mocked(useFichasAsesor).mockReset();
  });

  it('muestra un estado de carga accesible mientras llega la primera página', () => {
    // Arrange
    mockHook({ isLoading: true });

    // Act
    render(<ConsultarFichasAsesor onSeleccionar={vi.fn()} />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando fichas de perfil que asesoras…');
  });

  it('muestra el error con "Reintentar" que vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ isError: true, error: new Error('fallo') });
    render(<ConsultarFichasAsesor onSeleccionar={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar las fichas');
    expect(hook.refetch).toHaveBeenCalledTimes(1);
  });

  it('sin fichas muestra el vacío "Aún no tienes fichas asignadas"', () => {
    // Arrange
    mockHook({ data: crearPagina([]) });

    // Act
    render(<ConsultarFichasAsesor onSeleccionar={vi.fn()} />);

    // Assert
    expect(screen.getByText('Aún no tienes fichas asignadas')).toBeInTheDocument();
  });

  it('el título de la ficha llama a onSeleccionar con su id y título, y no hay "Ver detalle" ni "Actualizar"', async () => {
    // Arrange
    const user = userEvent.setup();
    const onSeleccionar = vi.fn();
    mockHook({ data: crearPagina([FICHA]) });
    render(<ConsultarFichasAsesor onSeleccionar={onSeleccionar} />);

    // Act
    await user.click(tabla().getByRole('button', { name: 'Abrir la ficha Sistema de monitoreo' }));

    // Assert
    expect(screen.getByText('1 ficha')).toBeInTheDocument();
    expect(onSeleccionar).toHaveBeenCalledWith({
      id: 'f-1',
      titulo: 'Sistema de monitoreo',
      estadoActual: '',
    });
    expect(
      screen.queryByRole('button', { name: /Ver detalle|Actualizar/ }),
    ).not.toBeInTheDocument();
  });

  it('con una sola página no muestra el paginador y con varias navega a la siguiente y a la última', async () => {
    // Arrange
    const user = userEvent.setup();
    mockHook({ data: crearPagina([FICHA]) });
    const { unmount } = render(<ConsultarFichasAsesor onSeleccionar={vi.fn()} />);

    // Assert
    expect(screen.queryByRole('navigation', { name: 'Paginación' })).not.toBeInTheDocument();
    unmount();

    // Arrange
    const hook = mockHook({ data: crearPagina([FICHA], { totalElements: 25, totalPages: 3 }) });
    render(<ConsultarFichasAsesor onSeleccionar={vi.fn()} />);
    const paginador = within(screen.getByRole('navigation', { name: 'Paginación' }));

    // Act
    await user.click(paginador.getByRole('button', { name: 'Página siguiente' }));
    await user.click(paginador.getByRole('button', { name: 'Página 3' }));

    // Assert
    expect(hook.goToPage).toHaveBeenNthCalledWith(1, 1);
    expect(hook.goToPage).toHaveBeenNthCalledWith(2, 2);
  });
});
