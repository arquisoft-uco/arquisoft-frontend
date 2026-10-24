import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../test-utils/render';
import ItemsCuantitativosJuradoView from './ItemsCuantitativosJuradoView';
import { useItemsCuantitativosJurado } from '../hooks/useItemsCuantitativosJurado';
import { useCategoriasItemCuantitativoJurado } from '../hooks/useCategoriasItemCuantitativoJurado';
import type { ItemCuantitativoJurado } from '../models/ItemCuantitativoJurado';
import type { CategoriaItemCuantitativoJurado } from '../models/CategoriaItemCuantitativoJurado';
import { Rol } from '../../../shared/models/rol';
import {
  resetAllStores,
  setActiveRole,
  setAuthenticatedUser,
} from '../../../test-utils/store.utils';

vi.mock('../hooks/useItemsCuantitativosJurado', () => ({
  useItemsCuantitativosJurado: vi.fn(),
}));

vi.mock('../hooks/useCategoriasItemCuantitativoJurado', () => ({
  useCategoriasItemCuantitativoJurado: vi.fn(),
}));

vi.mock('./CategoriasItemCuantitativoJuradoPanel', () => ({
  default: () => <section aria-label="Panel de categorías" />,
}));

vi.mock('./RegistrarItemCuantitativoJuradoPanel', () => ({
  default: ({ onCerrar }: { onCerrar: () => void }) => (
    <div role="dialog" aria-label="Panel de registro">
      <button type="button" onClick={onCerrar}>
        Cerrar panel
      </button>
    </div>
  ),
}));

vi.mock('./ModificarItemCuantitativoJuradoPanel', () => ({
  default: ({ onCerrar }: { onCerrar: () => void }) => (
    <div role="dialog" aria-label="Panel de modificación">
      <button type="button" onClick={onCerrar}>
        Cerrar panel
      </button>
    </div>
  ),
}));

vi.mock('./RemoverItemCuantitativoJuradoDialog', () => ({
  default: ({ onCerrar }: { onCerrar: () => void }) => (
    <div role="alertdialog" aria-label="Confirmar remoción">
      <button type="button" onClick={onCerrar}>
        Cerrar diálogo
      </button>
    </div>
  ),
}));

const ITEMS: ItemCuantitativoJurado[] = [
  { id: 'i-2', nombre: 'Rigor', descripcion: 'Calidad del método.', categoriaId: 'c-1', valor: 30 },
  { id: 'i-1', nombre: 'Impacto', descripcion: 'Alcance esperado.', categoriaId: 'c-2', valor: 20 },
];

const CATEGORIAS: CategoriaItemCuantitativoJurado[] = [
  { id: 'c-1', nombre: 'Técnica', descripcion: 'Aspectos técnicos.' },
  { id: 'c-2', nombre: 'Social', descripcion: 'Aspectos sociales.' },
];

function entrarComo(rol: Rol) {
  setAuthenticatedUser({ tokenParsed: { sub: 'u', realm_access: { roles: [rol] } } });
  setActiveRole(rol);
}

function mockItems(parcial: Partial<ReturnType<typeof useItemsCuantitativosJurado>>) {
  vi.mocked(useItemsCuantitativosJurado).mockReturnValue({
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useItemsCuantitativosJurado>);
}

function mockCategorias(parcial: Partial<ReturnType<typeof useCategoriasItemCuantitativoJurado>>) {
  vi.mocked(useCategoriasItemCuantitativoJurado).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    ...parcial,
  } as ReturnType<typeof useCategoriasItemCuantitativoJurado>);
}

describe('ItemsCuantitativosJuradoView', () => {
  beforeEach(() => {
    resetAllStores();
    vi.mocked(useItemsCuantitativosJurado).mockReset();
    vi.mocked(useCategoriasItemCuantitativoJurado).mockReset();
    mockCategorias({ data: CATEGORIAS });
  });

  it('lista nombre, descripción, categoría por nombre y valor en el orden recibido, sin botones de escritura', () => {
    // Arrange
    mockItems({ data: ITEMS });

    // Act
    render(<ItemsCuantitativosJuradoView />);

    // Assert
    const tabla = screen.getByRole('table', { name: 'Ítems cuantitativos del jurado' });
    const filas = within(tabla).getAllByRole('row').slice(1);
    expect(filas).toHaveLength(2);
    expect(within(filas[0]).getByText('Rigor')).toBeInTheDocument();
    expect(within(filas[0]).getByText('Calidad del método.')).toBeInTheDocument();
    expect(within(filas[0]).getByText('Técnica')).toBeInTheDocument();
    expect(within(filas[0]).getByText('30')).toBeInTheDocument();
    expect(within(filas[1]).getByText('Impacto')).toBeInTheDocument();
    expect(within(filas[1]).getByText('Social')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('muestra la sección de categorías aunque la consulta de ítems falle', () => {
    // Arrange
    mockItems({ isError: true });

    // Act
    render(<ItemsCuantitativosJuradoView />);

    // Assert
    expect(screen.getByRole('region', { name: 'Panel de categorías' })).toBeInTheDocument();
  });

  it('sin ítems, muestra el estado vacío', () => {
    // Arrange
    mockItems({ data: [] });

    // Act
    render(<ItemsCuantitativosJuradoView />);

    // Assert
    expect(screen.getByText('No hay ítems cuantitativos registrados.')).toBeInTheDocument();
  });

  it('mientras carga, muestra el estado de carga accesible y no la tabla', () => {
    // Arrange
    mockItems({ isLoading: true });

    // Act
    render(<ItemsCuantitativosJuradoView />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent(/cargando ítems cuantitativos/i);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('si la consulta falla, muestra el error y Reintentar vuelve a consultar', async () => {
    // Arrange
    const refetch = vi.fn();
    mockItems({ isError: true, refetch });
    const user = userEvent.setup();

    // Act
    render(<ItemsCuantitativosJuradoView />);
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(/no se pudieron cargar los ítems/i);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('si el catálogo de categorías falla, la lista sigue visible con No disponible y un aviso', () => {
    // Arrange
    mockItems({ data: ITEMS });
    mockCategorias({ data: undefined, isError: true });

    // Act
    render(<ItemsCuantitativosJuradoView />);

    // Assert
    expect(
      screen.getByText('No se pudieron cargar los nombres de las categorías.'),
    ).toBeInTheDocument();
    const tabla = screen.getByRole('table', { name: 'Ítems cuantitativos del jurado' });
    expect(within(tabla).getAllByText('No disponible')).toHaveLength(2);
    expect(within(tabla).getByText('Rigor')).toBeInTheDocument();
  });

  it('mientras el catálogo de categorías carga, no dice No disponible', () => {
    // Arrange
    mockItems({ data: ITEMS });
    mockCategorias({ data: undefined, isLoading: true });

    // Act
    render(<ItemsCuantitativosJuradoView />);

    // Assert
    const tabla = screen.getByRole('table', { name: 'Ítems cuantitativos del jurado' });
    expect(within(tabla).getByText('Rigor')).toBeInTheDocument();
    expect(within(tabla).getByText('Impacto')).toBeInTheDocument();
    expect(screen.queryByText('No disponible')).not.toBeInTheDocument();
    expect(screen.queryByText('Técnica')).not.toBeInTheDocument();
    expect(
      screen.queryByText('No se pudieron cargar los nombres de las categorías.'),
    ).not.toBeInTheDocument();
    expect(within(tabla).getAllByText('Cargando categoría')).toHaveLength(2);
  });

  it('el administrador ve «Registrar ítem», abre el panel y puede cerrarlo', async () => {
    // Arrange
    mockItems({ data: ITEMS });
    entrarComo(Rol.Administrador);
    const user = userEvent.setup();

    // Act
    render(<ItemsCuantitativosJuradoView />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Registrar ítem' }));

    // Assert
    expect(screen.getByRole('dialog', { name: 'Panel de registro' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cerrar panel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('el administrador ve «Editar» por fila y al pulsarlo abre el panel de modificación', async () => {
    // Arrange
    mockItems({ data: ITEMS });
    entrarComo(Rol.Administrador);
    const user = userEvent.setup();

    // Act
    render(<ItemsCuantitativosJuradoView />);
    const tabla = screen.getByRole('table', { name: 'Ítems cuantitativos del jurado' });
    expect(within(tabla).getAllByRole('button', { name: /^Editar ítem/ })).toHaveLength(2);
    await user.click(within(tabla).getByRole('button', { name: 'Editar ítem Rigor' }));

    // Assert
    expect(screen.getByRole('dialog', { name: 'Panel de modificación' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cerrar panel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('el administrador ve «Remover» por fila y al pulsarlo abre la confirmación', async () => {
    // Arrange
    mockItems({ data: ITEMS });
    entrarComo(Rol.Administrador);
    const user = userEvent.setup();

    // Act
    render(<ItemsCuantitativosJuradoView />);
    const tabla = screen.getByRole('table', { name: 'Ítems cuantitativos del jurado' });
    expect(within(tabla).getAllByRole('button', { name: /^Remover ítem/ })).toHaveLength(2);
    await user.click(within(tabla).getByRole('button', { name: 'Remover ítem Rigor' }));

    // Assert
    expect(screen.getByRole('alertdialog', { name: 'Confirmar remoción' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cerrar diálogo' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('el jurado no ve «Remover» en la lista', () => {
    // Arrange
    mockItems({ data: ITEMS });
    entrarComo(Rol.Jurado);

    // Act
    render(<ItemsCuantitativosJuradoView />);

    // Assert
    expect(screen.queryByRole('button', { name: /^Remover ítem/ })).not.toBeInTheDocument();
  });

  it('el jurado no ve «Editar» en la lista', () => {
    // Arrange
    mockItems({ data: ITEMS });
    entrarComo(Rol.Jurado);

    // Act
    render(<ItemsCuantitativosJuradoView />);

    // Assert
    expect(screen.queryByRole('button', { name: /^Editar ítem/ })).not.toBeInTheDocument();
  });

  it('el jurado ve la lista sin el botón «Registrar ítem»', () => {
    // Arrange
    mockItems({ data: ITEMS });
    entrarComo(Rol.Jurado);

    // Act
    render(<ItemsCuantitativosJuradoView />);

    // Assert
    expect(
      screen.getByRole('table', { name: 'Ítems cuantitativos del jurado' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Registrar ítem' })).not.toBeInTheDocument();
  });
});
