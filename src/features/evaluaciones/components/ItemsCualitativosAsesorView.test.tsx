import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../test-utils/render';
import ItemsCualitativosAsesorView from './ItemsCualitativosAsesorView';
import { useItemsCualitativosAsesor } from '../hooks/useItemsCualitativosAsesor';
import type { ItemCualitativoAsesor } from '../models/ItemCualitativoAsesor';

vi.mock('../hooks/useItemsCualitativosAsesor', () => ({
  useItemsCualitativosAsesor: vi.fn(),
}));

const ITEMS: ItemCualitativoAsesor[] = [
  { id: 'i-2', nombre: 'Claridad', descripcion: 'El documento se comprende sin ambigüedades.' },
  { id: 'i-1', nombre: 'Rigor', descripcion: 'El método es consistente con los objetivos.' },
];

function mockConsulta(parcial: Partial<ReturnType<typeof useItemsCualitativosAsesor>>) {
  vi.mocked(useItemsCualitativosAsesor).mockReturnValue({
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useItemsCualitativosAsesor>);
}

describe('ItemsCualitativosAsesorView', () => {
  beforeEach(() => {
    vi.mocked(useItemsCualitativosAsesor).mockReset();
  });

  it('mientras carga, muestra el skeleton accesible', () => {
    // Arrange
    mockConsulta({ isLoading: true });

    // Act
    render(<ItemsCualitativosAsesorView />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando ítems cualitativos del asesor');
  });

  it('con datos, muestra cada ítem en el orden recibido y no ofrece acciones de escritura', () => {
    // Arrange
    mockConsulta({ data: ITEMS });

    // Act
    render(<ItemsCualitativosAsesorView />);

    // Assert
    const tabla = screen.getByRole('table', { name: 'Ítems cualitativos del asesor' });
    const filas = within(tabla).getAllByRole('row').slice(1);
    expect(filas).toHaveLength(2);
    expect(within(filas[0]).getByText('Claridad')).toBeInTheDocument();
    expect(within(filas[0]).getByText(ITEMS[0].descripcion)).toBeInTheDocument();
    expect(within(filas[1]).getByText('Rigor')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /registrar|editar|remover/i })).toBeNull();
  });

  it('con lista vacía, muestra el mensaje de vacío y no un error', () => {
    // Arrange
    mockConsulta({ data: [] });

    // Act
    render(<ItemsCualitativosAsesorView />);

    // Assert
    expect(screen.getByText('No hay ítems cualitativos registrados.')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('con error, muestra el mensaje y «Reintentar» invoca refetch', async () => {
    // Arrange
    const refetch = vi.fn();
    mockConsulta({ isError: true, error: new Error('Servicio caído'), refetch });
    const user = userEvent.setup();

    // Act
    render(<ItemsCualitativosAsesorView />);
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
