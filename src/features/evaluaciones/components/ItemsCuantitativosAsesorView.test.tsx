import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../test-utils/render';
import ItemsCuantitativosAsesorView from './ItemsCuantitativosAsesorView';
import { useItemsCuantitativosAsesor } from '../hooks/useItemsCuantitativosAsesor';
import { useCategoriasItemCuantitativoAsesor } from '../hooks/useCategoriasItemCuantitativoAsesor';
import type { ItemCuantitativoAsesor } from '../models/ItemCuantitativoAsesor';
import type { CategoriaItemCuantitativoAsesor } from '../models/CategoriaItemCuantitativoAsesor';

vi.mock('../hooks/useItemsCuantitativosAsesor', () => ({
  useItemsCuantitativosAsesor: vi.fn(),
}));

vi.mock('../hooks/useCategoriasItemCuantitativoAsesor', () => ({
  useCategoriasItemCuantitativoAsesor: vi.fn(),
}));

vi.mock('./RegistrarItemCuantitativoAsesorPanel', () => ({
  default: ({ onCerrar }: { onCerrar: () => void }) => (
    <div role="dialog" aria-label="Panel de registro">
      <button type="button" onClick={onCerrar}>
        Cerrar panel
      </button>
    </div>
  ),
}));

vi.mock('./ModificarItemCuantitativoAsesorPanel', () => ({
  default: ({ item, onCerrar }: { item: ItemCuantitativoAsesor; onCerrar: () => void }) => (
    <div role="dialog" aria-label={`Panel de modificación de ${item.nombre}`}>
      <button type="button" onClick={onCerrar}>
        Cerrar panel
      </button>
    </div>
  ),
}));

const ITEMS: ItemCuantitativoAsesor[] = [
  { id: 'i-2', nombre: 'Rigor', descripcion: 'Calidad del método.', categoriaId: 'c-1', valor: 30 },
  { id: 'i-1', nombre: 'Impacto', descripcion: 'Alcance esperado.', categoriaId: 'c-9', valor: 20 },
];

const CATEGORIAS: CategoriaItemCuantitativoAsesor[] = [
  { id: 'c-1', nombre: 'Técnica', descripcion: 'Aspectos técnicos.' },
];

type Items = ReturnType<typeof useItemsCuantitativosAsesor>;
type Categorias = ReturnType<typeof useCategoriasItemCuantitativoAsesor>;

function mockItems(parcial: Partial<Items>) {
  vi.mocked(useItemsCuantitativosAsesor).mockReturnValue({
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    ...parcial,
  } as Items);
}

function mockCategorias(parcial: Partial<Categorias>) {
  vi.mocked(useCategoriasItemCuantitativoAsesor).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    ...parcial,
  } as Categorias);
}

describe('ItemsCuantitativosAsesorView', () => {
  beforeEach(() => {
    vi.mocked(useItemsCuantitativosAsesor).mockReset();
    vi.mocked(useCategoriasItemCuantitativoAsesor).mockReset();
    mockCategorias({ data: CATEGORIAS });
  });

  it('lista nombre, descripción, categoría y valor, con No disponible si la categoría no aparece', () => {
    // Arrange
    mockItems({ data: ITEMS });

    // Act
    render(<ItemsCuantitativosAsesorView />);

    // Assert
    const tabla = screen.getByRole('table', { name: 'Ítems cuantitativos del asesor' });
    const filas = within(tabla).getAllByRole('row').slice(1);
    expect(filas).toHaveLength(2);
    expect(within(filas[0]).getByText('Rigor')).toBeInTheDocument();
    expect(within(filas[0]).getByText('Calidad del método.')).toBeInTheDocument();
    expect(within(filas[0]).getByText('Técnica')).toBeInTheDocument();
    expect(within(filas[0]).getByText('30')).toBeInTheDocument();
    expect(within(filas[1]).getByText('No disponible')).toBeInTheDocument();
  });

  it('mientras carga, muestra el estado de carga accesible y no la tabla', () => {
    // Arrange
    mockItems({ isLoading: true });

    // Act
    render(<ItemsCuantitativosAsesorView />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent(
      /cargando ítems cuantitativos del asesor/i,
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('si la consulta falla, muestra el error y Reintentar vuelve a consultar', async () => {
    // Arrange
    const refetch = vi.fn();
    mockItems({ isError: true, refetch });
    const user = userEvent.setup();

    // Act
    render(<ItemsCuantitativosAsesorView />);
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(/no se pudieron cargar los ítems/i);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('sin ítems, muestra el estado vacío', () => {
    // Arrange
    mockItems({ data: [] });

    // Act
    render(<ItemsCuantitativosAsesorView />);

    // Assert
    expect(
      screen.getByText('No hay ítems cuantitativos del asesor registrados.'),
    ).toBeInTheDocument();
  });

  it('si el catálogo de categorías falla, la lista sigue visible con un aviso', () => {
    // Arrange
    mockItems({ data: ITEMS });
    mockCategorias({ data: undefined, isError: true });

    // Act
    render(<ItemsCuantitativosAsesorView />);

    // Assert
    expect(
      screen.getByText('No se pudieron cargar los nombres de las categorías.'),
    ).toBeInTheDocument();
    const tabla = screen.getByRole('table', { name: 'Ítems cuantitativos del asesor' });
    expect(within(tabla).getAllByText('No disponible')).toHaveLength(2);
  });

  it('«Registrar ítem» abre el panel y al cerrarlo desaparece', async () => {
    // Arrange
    mockItems({ data: ITEMS });
    const user = userEvent.setup();

    // Act
    render(<ItemsCuantitativosAsesorView />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Registrar ítem' }));

    // Assert
    expect(screen.getByRole('dialog', { name: 'Panel de registro' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cerrar panel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('«Editar» por fila abre el panel de modificación con el ítem de esa fila', async () => {
    // Arrange
    mockItems({ data: ITEMS });
    const user = userEvent.setup();

    // Act
    render(<ItemsCuantitativosAsesorView />);
    const tabla = screen.getByRole('table', { name: 'Ítems cuantitativos del asesor' });
    expect(within(tabla).getAllByRole('button', { name: /^Editar ítem/ })).toHaveLength(2);
    await user.click(within(tabla).getByRole('button', { name: 'Editar ítem Rigor' }));

    // Assert
    expect(
      screen.getByRole('dialog', { name: 'Panel de modificación de Rigor' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cerrar panel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
