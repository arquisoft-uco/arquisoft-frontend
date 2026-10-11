import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useAgregarObservacionItem } from './useAgregarObservacionItem';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: { agregarObservacionItem: vi.fn() },
}));

const agregar = vi.mocked(fichasPerfilService.agregarObservacionItem);

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

const REQ = { revisionItemId: 'r-1', observacion: 'Texto' };

describe('useAgregarObservacionItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama al service con el request e invalida las observaciones al tener éxito', async () => {
    // Arrange
    agregar.mockResolvedValue({ id: 'o-1' });
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useAgregarObservacionItem('f-1'), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(REQ));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(agregar.mock.calls[0][0]).toEqual(REQ);
    expect(invalidar).toHaveBeenCalledWith({
      queryKey: ['fichas-perfil', 'f-1', 'asesor-observaciones'],
    });
  });

  it('invalida las revisiones del asesor cuando el service rechaza', async () => {
    // Arrange
    agregar.mockRejectedValue(new Error('422'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useAgregarObservacionItem('f-1'), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(REQ));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledWith({
      queryKey: ['fichas-perfil', 'f-1', 'asesor-revisiones'],
    });
  });
});
