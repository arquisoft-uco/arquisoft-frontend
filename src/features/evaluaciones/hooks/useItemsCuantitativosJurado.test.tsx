import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { ItemCuantitativoJurado } from '../models/ItemCuantitativoJurado';
import { evaluacionesService } from '../services/evaluacionesService';
import { useItemsCuantitativosJurado } from './useItemsCuantitativosJurado';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: {
    getItemsCuantitativosJurado: vi.fn(),
  },
}));

const consultar = vi.mocked(evaluacionesService.getItemsCuantitativosJurado);

const ITEMS: ItemCuantitativoJurado[] = [
  { id: 'i-1', nombre: 'Impacto', descripcion: 'Alcance.', categoriaId: 'c-1', valor: 20 },
];

function crearContexto() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { Wrapper, queryClient };
}

describe('useItemsCuantitativosJurado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve los ítems del service y los guarda con la key del plan', async () => {
    // Arrange
    consultar.mockResolvedValue(ITEMS);
    const { Wrapper, queryClient } = crearContexto();

    // Act
    const { result } = renderHook(() => useItemsCuantitativosJurado(), { wrapper: Wrapper });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(ITEMS);
    expect(queryClient.getQueryData(['evaluaciones', 'items-cuantitativos-jurado'])).toEqual(ITEMS);
  });
});
