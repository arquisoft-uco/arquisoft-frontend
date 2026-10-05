import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import ItemsFichaAsesorPanel from './ItemsFichaAsesorPanel';
import { useItemsFichaAsesor } from '../../hooks/useItemsFichaAsesor';
import type { Item } from '../../models/fichas-perfil';

vi.mock('../../hooks/useTiposItem', () => ({ useTiposItem: vi.fn() }));
vi.mock('../../hooks/useItemsFichaAsesor', () => ({
  useItemsFichaAsesor: vi.fn(),
}));

function crearHookMock(
  parcial: Partial<ReturnType<typeof useItemsFichaAsesor>> = {},
): ReturnType<typeof useItemsFichaAsesor> {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useItemsFichaAsesor>;
}

const ITEM_1: Item = {
  id: 'i-1',
  tipoItem: { id: 't-1', nombre: 'Habilidad técnica' },
  contenido: 'React y TypeScript',
  fichaPerfilId: 'f-1',
};

const ITEM_2: Item = {
  id: 'i-2',
  tipoItem: { id: 't-2', nombre: 'Idioma' },
  contenido: 'Inglés B2',
  fichaPerfilId: 'f-1',
};

describe('ItemsFichaAsesorPanel', () => {
  beforeEach(() => {
    vi.mocked(useItemsFichaAsesor).mockReset();
  });

  it('consulta los ítems de la ficha indicada y muestra la carga accesible', () => {
    // Arrange
    vi.mocked(useItemsFichaAsesor).mockReturnValue(crearHookMock({ isLoading: true }));

    // Act
    render(<ItemsFichaAsesorPanel fichaPerfilId="f-1" />);

    // Assert
    expect(useItemsFichaAsesor).toHaveBeenCalledWith('f-1');
    expect(screen.getByRole('status')).toHaveTextContent('Cargando ítems…');
  });

  it('cuando la consulta falla avisa y "Reintentar" vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = crearHookMock({ isError: true });
    vi.mocked(useItemsFichaAsesor).mockReturnValue(hook);
    render(<ItemsFichaAsesorPanel fichaPerfilId="f-1" />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar los ítems');
    expect(hook.refetch).toHaveBeenCalledTimes(1);
  });

  it('muestra el vacío cuando la ficha no tiene ítems', () => {
    // Arrange
    vi.mocked(useItemsFichaAsesor).mockReturnValue(crearHookMock({ data: [] }));

    // Act
    render(<ItemsFichaAsesorPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getByText('Esta ficha aún no tiene ítems.')).toBeInTheDocument();
  });

  it('lista cada ítem con su tipo y su contenido, y ofrece la ayuda de tipos de ítem', () => {
    // Arrange
    vi.mocked(useItemsFichaAsesor).mockReturnValue(crearHookMock({ data: [ITEM_1, ITEM_2] }));

    // Act
    render(<ItemsFichaAsesorPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Habilidad técnica')).toBeInTheDocument();
    expect(screen.getByText('React y TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Idioma')).toBeInTheDocument();
    expect(screen.getByText('Inglés B2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '¿Qué tipos de ítem existen?' })).toBeInTheDocument();
  });
});
