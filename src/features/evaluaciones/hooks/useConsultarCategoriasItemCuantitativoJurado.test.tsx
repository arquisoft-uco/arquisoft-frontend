import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { CategoriaItemCuantitativoJurado } from '../models/CategoriaItemCuantitativoJurado';
import { evaluacionesService } from '../services/evaluacionesService';
import { useConsultarCategoriasItemCuantitativoJurado } from './useConsultarCategoriasItemCuantitativoJurado';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: {
    getCategoriasItemCuantitativoJurado: vi.fn(),
  },
}));

const consultar = vi.mocked(evaluacionesService.getCategoriasItemCuantitativoJurado);

const CATEGORIAS: CategoriaItemCuantitativoJurado[] = [
  { id: 'c-1', nombre: 'Técnica', descripcion: 'Aspectos técnicos.' },
];

function crearContexto() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { Wrapper, queryClient };
}

describe('useConsultarCategoriasItemCuantitativoJurado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockResolvedValue(CATEGORIAS);
  });

  it('recorta el texto antes de consultar y lo incluye en la key', async () => {
    // Arrange
    const { Wrapper, queryClient } = crearContexto();

    // Act
    const { result } = renderHook(
      () => useConsultarCategoriasItemCuantitativoJurado('  Técnica '),
      {
        wrapper: Wrapper,
      },
    );

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(consultar).toHaveBeenCalledWith('Técnica');
    expect(
      queryClient.getQueryData([
        'evaluaciones',
        'categorias-item-cuantitativo-jurado',
        'consulta',
        'Técnica',
      ]),
    ).toEqual(CATEGORIAS);
  });

  it('consulta sin filtro cuando el texto está vacío o solo tiene espacios', async () => {
    // Arrange
    const { Wrapper } = crearContexto();

    // Act
    const { result } = renderHook(() => useConsultarCategoriasItemCuantitativoJurado('   '), {
      wrapper: Wrapper,
    });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(consultar).toHaveBeenCalledWith(undefined);
  });

  it('recorta a 100 caracteres un texto más largo', async () => {
    // Arrange
    const { Wrapper } = crearContexto();

    // Act
    const { result } = renderHook(
      () => useConsultarCategoriasItemCuantitativoJurado('a'.repeat(150)),
      { wrapper: Wrapper },
    );

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(consultar).toHaveBeenCalledWith('a'.repeat(100));
  });
});
