import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { artefactosService } from '../services/artefactosService';
import { useOmitirArtefacto } from './useOmitirArtefacto';

vi.mock('../services/artefactosService', () => ({
  artefactosService: { omitirArtefacto: vi.fn() },
}));

const omitir = vi.mocked(artefactosService.omitirArtefacto);

function error422(errorCode: string) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Unprocessable Entity', errorCode, message: 'del backend', status: 422 },
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('useOmitirArtefacto', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('en éxito invalida el listado del asesor por su prefijo', async () => {
    // Arrange
    omitir.mockResolvedValue(undefined);
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useOmitirArtefacto(), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    await act(async () => {
      await result.current.mutateAsync('a-1');
    });

    // Assert
    expect(omitir).toHaveBeenCalledWith('a-1');
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'asesor'] });
  });

  it('un 422 de dato obsoleto invalida y cualquier otro 422 no', async () => {
    // Arrange
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useOmitirArtefacto(), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    omitir.mockRejectedValueOnce(error422('ARTEFACTOS_ARTEFACTO_ASESOR_NO_PROPIETARIO'));
    act(() => result.current.mutate('a-1'));
    await waitFor(() => expect(result.current.isError).toBe(true));
    const trasOtro = invalidar.mock.calls.length;

    omitir.mockRejectedValueOnce(error422('ARTEFACTOS_ARTEFACTO_OMITIDO'));
    act(() => result.current.mutate('a-1'));
    await waitFor(() =>
      expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'asesor'] }),
    );

    // Assert
    expect(trasOtro).toBe(0);
  });
});
