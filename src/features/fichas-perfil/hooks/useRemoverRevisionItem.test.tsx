import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useRemoverRevisionItem } from './useRemoverRevisionItem';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: { removerRevisionItem: vi.fn() },
}));

const removerRevision = vi.mocked(fichasPerfilService.removerRevisionItem);

function crearContexto() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { Wrapper, invalidar };
}

describe('useRemoverRevisionItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama al service con el id e invalida las revisiones y los ítems del asesor de la ficha', async () => {
    // Arrange
    removerRevision.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRemoverRevisionItem('f-1'), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate('r-1'));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(removerRevision.mock.calls[0][0]).toBe('r-1');
    expect(invalidar).toHaveBeenCalledWith({
      queryKey: ['fichas-perfil', 'f-1', 'asesor-revisiones'],
    });
    expect(invalidar).toHaveBeenCalledWith({
      queryKey: ['fichas-perfil', 'f-1', 'asesor-items'],
    });
  });
});
