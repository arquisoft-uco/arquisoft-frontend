import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '../../../test-utils/render';
import ItemsCualitativosJuradoView from './ItemsCualitativosJuradoView';
import { useItemsCualitativosJurado } from '../hooks/useItemsCualitativosJurado';
import type { ItemCualitativoJurado } from '../models/ItemCualitativoJurado';

vi.mock('../hooks/useItemsCualitativosJurado', () => ({
  useItemsCualitativosJurado: vi.fn(),
}));

const ITEMS: ItemCualitativoJurado[] = [
  { id: 'i-2', nombre: 'Claridad', descripcion: 'El documento se comprende sin ambigüedades.' },
  { id: 'i-1', nombre: 'Aplicabilidad', descripcion: 'La propuesta resuelve un problema real del contexto.' },
];

function mockConsulta(parcial: Partial<ReturnType<typeof useItemsCualitativosJurado>>) {
  vi.mocked(useItemsCualitativosJurado).mockReturnValue({
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    ...parcial,
  } as ReturnType<typeof useItemsCualitativosJurado>);
}

describe('ItemsCualitativosJuradoView', () => {
  beforeEach(() => {
    vi.mocked(useItemsCualitativosJurado).mockReset();
  });

  it('con datos, muestra nombre y descripción completa de cada ítem en el orden recibido', () => {
    // Arrange
    mockConsulta({ data: ITEMS });

    // Act
    render(<ItemsCualitativosJuradoView />);

    // Assert
    const tabla = screen.getByRole('table', { name: 'Ítems cualitativos del jurado' });
    const filas = within(tabla).getAllByRole('row').slice(1);
    expect(filas).toHaveLength(2);
    expect(within(filas[0]).getByText('Claridad')).toBeInTheDocument();
    expect(within(filas[0]).getByText(ITEMS[0].descripcion)).toBeInTheDocument();
    expect(within(filas[1]).getByText('Aplicabilidad')).toBeInTheDocument();
    expect(within(filas[1]).getByText(ITEMS[1].descripcion)).toBeInTheDocument();
  });

  it('con lista vacía, muestra el mensaje de vacío y no un error', () => {
    // Arrange
    mockConsulta({ data: [] });

    // Act
    render(<ItemsCualitativosJuradoView />);

    // Assert
    expect(screen.getByText('No hay ítems cualitativos registrados.')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('mientras carga, muestra el estado de carga accesible y no la tabla', () => {
    // Arrange
    mockConsulta({ isLoading: true });

    // Act
    render(<ItemsCualitativosJuradoView />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando ítems cualitativos del jurado');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('si la consulta falla, muestra un bloque de error con role alert y no la tabla', () => {
    // Arrange
    mockConsulta({ isError: true, error: new Error('fallo de red') });

    // Act
    render(<ItemsCualitativosJuradoView />);

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(/no se pudieron cargar los ítems/i);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
