import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '../../../test-utils/render';
import {
  avanzar,
  restaurarTemporizadores,
  usarTemporizadoresFalsos,
} from '../../../test-utils/temporizadores';
import CategoriasItemCuantitativoJuradoPanel from './CategoriasItemCuantitativoJuradoPanel';
import { useConsultarCategoriasItemCuantitativoJurado } from '../hooks/useConsultarCategoriasItemCuantitativoJurado';
import type { CategoriaItemCuantitativoJurado } from '../models/CategoriaItemCuantitativoJurado';

vi.mock('../hooks/useConsultarCategoriasItemCuantitativoJurado', () => ({
  useConsultarCategoriasItemCuantitativoJurado: vi.fn(),
}));

const CATEGORIAS: CategoriaItemCuantitativoJurado[] = [
  { id: 'c-1', nombre: 'Social', descripcion: 'Aspectos sociales.' },
  { id: 'c-2', nombre: 'Técnica', descripcion: 'Aspectos técnicos.' },
];

function mockConsulta(
  parcial: Partial<ReturnType<typeof useConsultarCategoriasItemCuantitativoJurado>>,
) {
  vi.mocked(useConsultarCategoriasItemCuantitativoJurado).mockReturnValue({
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useConsultarCategoriasItemCuantitativoJurado>);
}

describe('CategoriasItemCuantitativoJuradoPanel', () => {
  beforeEach(() => {
    vi.mocked(useConsultarCategoriasItemCuantitativoJurado).mockReset();
  });

  afterEach(() => {
    restaurarTemporizadores();
  });

  it('muestra nombre y descripción de cada categoría', () => {
    // Arrange
    mockConsulta({ data: CATEGORIAS });

    // Act
    render(<CategoriasItemCuantitativoJuradoPanel />);

    // Assert
    const tabla = screen.getByRole('table', {
      name: 'Categorías de ítems cuantitativos del jurado',
    });
    expect(within(tabla).getByText('Social')).toBeInTheDocument();
    expect(within(tabla).getByText('Aspectos técnicos.')).toBeInTheDocument();
  });

  it('al teclear en la búsqueda, el hook recibe el texto tras el retardo', async () => {
    // Arrange
    mockConsulta({ data: CATEGORIAS });
    const user = usarTemporizadoresFalsos();
    render(<CategoriasItemCuantitativoJuradoPanel />);

    // Act
    await user.type(screen.getByRole('textbox', { name: 'Buscar categoría por nombre' }), 'téc');
    avanzar(300);

    // Assert
    expect(useConsultarCategoriasItemCuantitativoJurado).toHaveBeenLastCalledWith('téc');
  });

  it('sin categorías y sin filtro, muestra que no hay categorías registradas', () => {
    // Arrange
    mockConsulta({ data: [] });

    // Act
    render(<CategoriasItemCuantitativoJuradoPanel />);

    // Assert
    expect(screen.getByText('No hay categorías registradas')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
  });

  it('sin coincidencias con filtro activo, «Limpiar filtros» vacía la búsqueda', async () => {
    // Arrange
    mockConsulta({ data: [] });
    const user = usarTemporizadoresFalsos();
    render(<CategoriasItemCuantitativoJuradoPanel />);
    const campo = screen.getByRole('textbox', { name: 'Buscar categoría por nombre' });
    await user.type(campo, 'zzz');
    avanzar(300);

    // Act
    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    avanzar(300);

    // Assert
    expect(campo).toHaveValue('');
    expect(useConsultarCategoriasItemCuantitativoJurado).toHaveBeenLastCalledWith('');
  });

  it('si la consulta falla, muestra el error y Reintentar vuelve a consultar', async () => {
    // Arrange
    const refetch = vi.fn();
    mockConsulta({ isError: true, refetch });
    const user = usarTemporizadoresFalsos();

    // Act
    render(<CategoriasItemCuantitativoJuradoPanel />);
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar las categorías.');
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('mientras carga, muestra el esqueleto y mantiene la búsqueda visible', () => {
    // Arrange
    mockConsulta({ isLoading: true });

    // Act
    render(<CategoriasItemCuantitativoJuradoPanel />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent(/cargando categorías/i);
    expect(
      screen.getByRole('textbox', { name: 'Buscar categoría por nombre' }),
    ).toBeInTheDocument();
  });
});
