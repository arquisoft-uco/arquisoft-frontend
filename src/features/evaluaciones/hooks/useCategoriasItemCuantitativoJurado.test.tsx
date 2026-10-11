import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { CategoriaItemCuantitativoJurado } from '../models/CategoriaItemCuantitativoJurado';
import { evaluacionesService } from '../services/evaluacionesService';
import { useCategoriasItemCuantitativoJurado } from './useCategoriasItemCuantitativoJurado';

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

describe('useCategoriasItemCuantitativoJurado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve las categorías del service y las guarda con la key del plan', async () => {
    // Arrange
    consultar.mockResolvedValue(CATEGORIAS);
    const { Wrapper, queryClient } = crearContexto();

    // Act
    const { result } = renderHook(() => useCategoriasItemCuantitativoJurado(), {
      wrapper: Wrapper,
    });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(CATEGORIAS);
    expect(
      queryClient.getQueryData(['evaluaciones', 'categorias-item-cuantitativo-jurado']),
    ).toEqual(CATEGORIAS);
  });
});
