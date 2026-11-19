import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useReabrirObservacionItem } from './useReabrirObservacionItem';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: { reabrirObservacionItem: vi.fn() },
}));

const reabrir = vi.mocked(fichasPerfilService.reabrirObservacionItem);

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

const CLAVE_OBSERVACIONES = ['fichas-perfil', 'f-1', 'asesor-observaciones'];
const CLAVE_REVISIONES = ['fichas-perfil', 'f-1', 'asesor-revisiones'];

describe('useReabrirObservacionItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama al service con el id e invalida observaciones y revisiones al tener éxito', async () => {
    // Arrange
    reabrir.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useReabrirObservacionItem('f-1'), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate('o-1'));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(reabrir.mock.calls[0][0]).toBe('o-1');
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_OBSERVACIONES });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_REVISIONES });
  });

  it('invalida observaciones y revisiones también cuando el service rechaza', async () => {
    // Arrange
    reabrir.mockRejectedValue(new Error('422'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useReabrirObservacionItem('f-1'), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate('o-1'));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_OBSERVACIONES });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_REVISIONES });
  });
});
