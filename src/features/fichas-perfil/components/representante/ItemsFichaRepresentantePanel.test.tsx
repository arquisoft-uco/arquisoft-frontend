import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../../test-utils/render';
import ItemsFichaRepresentantePanel from './ItemsFichaRepresentantePanel';
import { useItemsFichaRepresentante } from '../../hooks/useItemsFichaRepresentante';
import type { Item } from '../../models/fichas-perfil';

vi.mock('../../hooks/useItemsFichaRepresentante', () => ({
  useItemsFichaRepresentante: vi.fn(),
}));

function crearHookMock(
  parcial: Partial<ReturnType<typeof useItemsFichaRepresentante>> = {},
): ReturnType<typeof useItemsFichaRepresentante> {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    ...parcial,
  } as ReturnType<typeof useItemsFichaRepresentante>;
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

describe('ItemsFichaRepresentantePanel', () => {
  beforeEach(() => {
    vi.mocked(useItemsFichaRepresentante).mockReset();
  });

  it('muestra el estado de carga con un texto accesible', () => {
    vi.mocked(useItemsFichaRepresentante).mockReturnValue(crearHookMock({ isLoading: true }));

    render(<ItemsFichaRepresentantePanel fichaPerfilId="f-1" />);

    expect(screen.getByRole('status')).toHaveTextContent('Cargando ítems...');
  });

  it('muestra un aviso con role="alert" cuando la consulta falla', () => {
    vi.mocked(useItemsFichaRepresentante).mockReturnValue(crearHookMock({ isError: true }));

    render(<ItemsFichaRepresentantePanel fichaPerfilId="f-1" />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar los ítems. Intenta nuevamente.',
    );
  });

  it('muestra el bloque vacío, sin alerta, cuando la ficha no tiene ítems', () => {
    vi.mocked(useItemsFichaRepresentante).mockReturnValue(crearHookMock({ data: [] }));

    render(<ItemsFichaRepresentantePanel fichaPerfilId="f-1" />);

    expect(screen.getByText('Esta ficha no tiene ítems registrados.')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('lista el tipo y el contenido de cada ítem y consulta con el id de la ficha', () => {
    vi.mocked(useItemsFichaRepresentante).mockReturnValue(crearHookMock({ data: [ITEM_1, ITEM_2] }));

    render(<ItemsFichaRepresentantePanel fichaPerfilId="f-1" />);

    expect(useItemsFichaRepresentante).toHaveBeenCalledWith('f-1');
    expect(screen.getByText('Habilidad técnica')).toBeInTheDocument();
    expect(screen.getByText('React y TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Idioma')).toBeInTheDocument();
    expect(screen.getByText('Inglés B2')).toBeInTheDocument();
  });
});
