import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../../test-utils/render';
import { useItemsMiFicha } from '../../hooks/useItemsMiFicha';
import ItemsMiFichaPanel from './ItemsMiFichaPanel';

vi.mock('../../hooks/useItemsMiFicha', () => ({ useItemsMiFicha: vi.fn() }));

const mutacion = { mutate: vi.fn(), isPending: false } as never;

function conEstado(parcial: Partial<ReturnType<typeof useItemsMiFicha>>) {
  vi.mocked(useItemsMiFicha).mockReturnValue({
    fichaId: 'f-1',
    items: [],
    tiposItem: [],
    isLoading: false,
    isError: false,
    agregar: mutacion,
    modificar: mutacion,
    remover: mutacion,
    ...parcial,
  });
}

describe('ItemsMiFichaPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el estado de carga', () => {
    // Arrange
    conEstado({ isLoading: true });

    // Act
    render(<ItemsMiFichaPanel />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando ítems de la ficha...');
    expect(screen.queryByText(/aún no tiene ítems/)).not.toBeInTheDocument();
  });

  it('lista cada ítem con el nombre de su tipo y su contenido', () => {
    // Arrange
    conEstado({
      items: [{ id: 'i-1', fichaPerfilId: 'f-1', tipoItem: { id: 't-1', nombre: 'Objetivo' }, contenido: 'Medir consumo' }],
    });

    // Act
    render(<ItemsMiFichaPanel />);

    // Assert
    expect(screen.getByText('Objetivo')).toBeInTheDocument();
    expect(screen.getByText('Medir consumo')).toBeInTheDocument();
  });

  it('invita a agregar el primer ítem cuando la ficha no tiene ninguno', () => {
    // Arrange
    conEstado({});

    // Act
    render(<ItemsMiFichaPanel />);

    // Assert
    expect(screen.getByText(/Tu ficha aún no tiene ítems/)).toBeInTheDocument();
  });

  it('muestra una alerta accionable cuando falla la carga y no el vacío', () => {
    // Arrange
    conEstado({ isError: true });

    // Act
    render(<ItemsMiFichaPanel />);

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar los ítems de tu ficha');
    expect(screen.queryByText(/aún no tiene ítems/)).not.toBeInTheDocument();
  });
});
