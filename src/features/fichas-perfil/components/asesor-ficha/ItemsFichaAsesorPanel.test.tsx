import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../../test-utils/render';
import ItemsFichaAsesorPanel from './ItemsFichaAsesorPanel';
import { useItemsFichaAsesor } from '../../hooks/useItemsFichaAsesor';
import type { Item } from '../../models/fichas-perfil';

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

  it('muestra el estado de carga con un texto accesible', () => {
    vi.mocked(useItemsFichaAsesor).mockReturnValue(crearHookMock({ isLoading: true }));

    render(<ItemsFichaAsesorPanel fichaPerfilId="f-1" />);

    expect(screen.getByRole('status')).toHaveTextContent('Cargando ítems...');
  });

  it('muestra un aviso con role="alert" cuando la consulta falla', () => {
    vi.mocked(useItemsFichaAsesor).mockReturnValue(crearHookMock({ isError: true }));

    render(<ItemsFichaAsesorPanel fichaPerfilId="f-1" />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar los ítems. Intenta nuevamente.',
    );
  });

  it('muestra el texto de vacío cuando la ficha no tiene ítems', () => {
    vi.mocked(useItemsFichaAsesor).mockReturnValue(crearHookMock({ data: [] }));

    render(<ItemsFichaAsesorPanel fichaPerfilId="f-1" />);

    expect(screen.getByText('Esta ficha no tiene ítems registrados.')).toBeInTheDocument();
  });

  it('lista cada ítem con su tipo y su contenido', () => {
    vi.mocked(useItemsFichaAsesor).mockReturnValue(crearHookMock({ data: [ITEM_1, ITEM_2] }));

    render(<ItemsFichaAsesorPanel fichaPerfilId="f-1" />);

    expect(screen.getByRole('heading', { name: 'Ítems de la Ficha' })).toBeInTheDocument();
    expect(screen.getByText('Habilidad técnica')).toBeInTheDocument();
    expect(screen.getByText('React y TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Idioma')).toBeInTheDocument();
    expect(screen.getByText('Inglés B2')).toBeInTheDocument();
  });
});
