import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { ItemCualitativoAsesor } from '../models/ItemCualitativoAsesor';
import { evaluacionesService } from '../services/evaluacionesService';
import { useItemsCualitativosAsesor } from './useItemsCualitativosAsesor';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: {
    getItemsCualitativosAsesor: vi.fn(),
  },
}));

const consultar = vi.mocked(evaluacionesService.getItemsCualitativosAsesor);

const ITEMS: ItemCualitativoAsesor[] = [
  { id: 'i-1', nombre: 'Claridad', descripcion: 'El documento se comprende.' },
];

function crearContexto() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { Wrapper, queryClient };
}

describe('useItemsCualitativosAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve los ítems del service y los guarda con la key del plan', async () => {
    // Arrange
    consultar.mockResolvedValue(ITEMS);
    const { Wrapper, queryClient } = crearContexto();

    // Act
    const { result } = renderHook(() => useItemsCualitativosAsesor(), { wrapper: Wrapper });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(ITEMS);
    expect(queryClient.getQueryData(['evaluaciones', 'items-cualitativos-asesor'])).toEqual(ITEMS);
  });

  it('deja isError cuando el service falla', async () => {
    // Arrange
    consultar.mockRejectedValue(new Error('fallo'));
    const { Wrapper } = crearContexto();

    // Act
    const { result } = renderHook(() => useItemsCualitativosAsesor(), { wrapper: Wrapper });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
