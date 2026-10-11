import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../test-utils/render';
import ItemsCuantitativosJuradoView from './ItemsCuantitativosJuradoView';
import { useItemsCuantitativosJurado } from '../hooks/useItemsCuantitativosJurado';
import { useCategoriasItemCuantitativoJurado } from '../hooks/useCategoriasItemCuantitativoJurado';
import type { ItemCuantitativoJurado } from '../models/ItemCuantitativoJurado';
import type { CategoriaItemCuantitativoJurado } from '../models/CategoriaItemCuantitativoJurado';

vi.mock('../hooks/useItemsCuantitativosJurado', () => ({
  useItemsCuantitativosJurado: vi.fn(),
}));

vi.mock('../hooks/useCategoriasItemCuantitativoJurado', () => ({
  useCategoriasItemCuantitativoJurado: vi.fn(),
}));

const ITEMS: ItemCuantitativoJurado[] = [
  { id: 'i-2', nombre: 'Rigor', descripcion: 'Calidad del método.', categoriaId: 'c-1', valor: 30 },
  { id: 'i-1', nombre: 'Impacto', descripcion: 'Alcance esperado.', categoriaId: 'c-2', valor: 20 },
];

const CATEGORIAS: CategoriaItemCuantitativoJurado[] = [
  { id: 'c-1', nombre: 'Técnica', descripcion: 'Aspectos técnicos.' },
  { id: 'c-2', nombre: 'Social', descripcion: 'Aspectos sociales.' },
];

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
    isError: false,
    ...parcial,
  } as ReturnType<typeof useCategoriasItemCuantitativoJurado>);
}

describe('ItemsCuantitativosJuradoView', () => {
  beforeEach(() => {
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
});
