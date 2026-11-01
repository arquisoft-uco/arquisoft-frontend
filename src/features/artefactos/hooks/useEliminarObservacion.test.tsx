import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { artefactosService } from '../services/artefactosService';
import { useEliminarObservacion } from './useEliminarObservacion';

vi.mock('../services/artefactosService', () => ({
  artefactosService: { eliminarObservacion: vi.fn() },
}));

const eliminar = vi.mocked(artefactosService.eliminarObservacion);

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

describe('useEliminarObservacion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama al service con el id e invalida el prefijo de observaciones de revisiones', async () => {
    // Arrange
    eliminar.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useEliminarObservacion(), { wrapper: Wrapper });

    // Act
    await act(() => result.current.mutateAsync('o-1'));

    // Assert
    expect(eliminar.mock.calls[0][0]).toBe('o-1');
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'revisiones-asesor'] });
  });

  it('si el service falla igual invalida el prefijo y expone el error', async () => {
    // Arrange
    eliminar.mockRejectedValue(new Error('422'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useEliminarObservacion(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate('o-1'));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'revisiones-asesor'] });
  });
});
