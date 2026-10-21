import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useRemoverObservacionItem } from './useRemoverObservacionItem';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: { removerObservacionItem: vi.fn() },
}));

const remover = vi.mocked(fichasPerfilService.removerObservacionItem);

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

const REQ = 'o-1';
const CLAVE_OBSERVACIONES = ['fichas-perfil', 'f-1', 'asesor-observaciones'];
const CLAVE_REVISIONES = ['fichas-perfil', 'f-1', 'asesor-revisiones'];

describe('useRemoverObservacionItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama al service con el request e invalida solo las observaciones al tener éxito', async () => {
    // Arrange
    remover.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRemoverObservacionItem('f-1'), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(REQ));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(remover.mock.calls[0][0]).toBe(REQ);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_OBSERVACIONES });
    expect(invalidar).not.toHaveBeenCalledWith({ queryKey: CLAVE_REVISIONES });
  });

  it('invalida las revisiones y las observaciones cuando el service rechaza', async () => {
    // Arrange
    remover.mockRejectedValue(new Error('422'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRemoverObservacionItem('f-1'), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(REQ));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_REVISIONES });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_OBSERVACIONES });
  });
});
