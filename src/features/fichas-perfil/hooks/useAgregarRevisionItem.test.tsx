import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useAgregarRevisionItem } from './useAgregarRevisionItem';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: { agregarRevisionItem: vi.fn() },
}));

const agregarRevision = vi.mocked(fichasPerfilService.agregarRevisionItem);

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

describe('useAgregarRevisionItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama al service con el itemId e invalida las revisiones y los ítems del asesor de la ficha', async () => {
    // Arrange
    agregarRevision.mockResolvedValue({ id: 'r-1' });
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useAgregarRevisionItem('f-1'), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate('i-1'));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(agregarRevision.mock.calls[0][0]).toBe('i-1');
    expect(invalidar).toHaveBeenCalledWith({
      queryKey: ['fichas-perfil', 'f-1', 'asesor-revisiones'],
    });
    expect(invalidar).toHaveBeenCalledWith({
      queryKey: ['fichas-perfil', 'f-1', 'asesor-items'],
    });
  });

  it('invalida ambas también cuando el service rechaza, porque la lista pudo estar desactualizada', async () => {
    // Arrange
    agregarRevision.mockRejectedValue(new Error('422'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useAgregarRevisionItem('f-1'), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate('i-1'));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledWith({
      queryKey: ['fichas-perfil', 'f-1', 'asesor-revisiones'],
    });
    expect(invalidar).toHaveBeenCalledWith({
      queryKey: ['fichas-perfil', 'f-1', 'asesor-items'],
    });
  });
});
