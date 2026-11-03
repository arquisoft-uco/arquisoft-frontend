import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { artefactosService } from '../services/artefactosService';
import { ARTEFACTO_OMITIDO } from '../utils/errores-omitir-artefacto';
import { useCambiarVersionRepositorioArtefacto } from './useCambiarVersionRepositorioArtefacto';

vi.mock('../services/artefactosService', () => ({
  artefactosService: { cambiarVersionRepositorioArtefacto: vi.fn() },
}));

const cambiar = vi.mocked(artefactosService.cambiarVersionRepositorioArtefacto);
const REQ = { artefactoId: 'art-1', versionRepositorioId: 'v-2' };

function error422(errorCode: string) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Unprocessable Entity', errorCode, message: 'm', status: 422 },
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

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

describe('useCambiarVersionRepositorioArtefacto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('en éxito llama al service e invalida el listado y las versiones del artefacto', async () => {
    // Arrange
    cambiar.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useCambiarVersionRepositorioArtefacto(), {
      wrapper: Wrapper,
    });

    // Act
    await act(() => result.current.mutateAsync(REQ));

    // Assert
    expect(cambiar).toHaveBeenCalledWith(REQ);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'asesor'] });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'versiones-artefacto'] });
  });

  it('un error que desactualiza el listado también invalida', async () => {
    // Arrange
    cambiar.mockRejectedValue(error422(ARTEFACTO_OMITIDO));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useCambiarVersionRepositorioArtefacto(), {
      wrapper: Wrapper,
    });

    // Act
    act(() => result.current.mutate(REQ));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'asesor'] });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'versiones-artefacto'] });
  });

  it('un error inesperado no invalida', async () => {
    // Arrange
    cambiar.mockRejectedValue(new Error('500'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useCambiarVersionRepositorioArtefacto(), {
      wrapper: Wrapper,
    });

    // Act
    act(() => result.current.mutate(REQ));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
