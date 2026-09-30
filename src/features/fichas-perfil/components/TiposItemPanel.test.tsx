import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../test-utils/render';
import TiposItemPanel from './TiposItemPanel';
import { useTiposItem } from '../hooks/useTiposItem';

vi.mock('../hooks/useTiposItem', () => ({
  useTiposItem: vi.fn(),
}));

function crearTiposMock(
  parcial: Partial<ReturnType<typeof useTiposItem>> = {},
): ReturnType<typeof useTiposItem> {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    ...parcial,
  } as ReturnType<typeof useTiposItem>;
}

describe('TiposItemPanel', () => {
  beforeEach(() => {
    vi.mocked(useTiposItem).mockReset();
  });

  it('muestra el spinner accesible mientras carga el catálogo', () => {
    // Arrange
    vi.mocked(useTiposItem).mockReturnValue(crearTiposMock({ isLoading: true }));

    // Act
    render(<TiposItemPanel />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando tipos de ítem...');
  });

  it('muestra nombre y descripción de cada tipo de ítem', () => {
    // Arrange
    vi.mocked(useTiposItem).mockReturnValue(
      crearTiposMock({
        data: [
          { id: '1', nombre: 'Problema', descripcion: 'Describe el problema' },
          { id: '2', nombre: 'Objetivo', descripcion: 'Describe el objetivo' },
        ],
      }),
    );

    // Act
    render(<TiposItemPanel />);

    // Assert
    expect(screen.getByRole('table', { name: 'Tipos de ítem' })).toBeInTheDocument();
    expect(screen.getByText('Problema')).toBeInTheDocument();
    expect(screen.getByText('Describe el problema')).toBeInTheDocument();
    expect(screen.getByText('Objetivo')).toBeInTheDocument();
    expect(screen.getByText('Describe el objetivo')).toBeInTheDocument();
  });

  it('muestra el mensaje de vacío cuando no hay tipos de ítem', () => {
    // Arrange
    vi.mocked(useTiposItem).mockReturnValue(crearTiposMock({ data: [] }));

    // Act
    render(<TiposItemPanel />);

    // Assert
    expect(screen.getByText('No hay tipos de ítem registrados')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('muestra el error con role="alert" cuando la consulta falla', () => {
    // Arrange
    vi.mocked(useTiposItem).mockReturnValue(
      crearTiposMock({ isError: true, error: new Error('boom') }),
    );

    // Act
    render(<TiposItemPanel />);

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar los tipos de ítem');
  });
});
