import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { AxiosError, AxiosHeaders } from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { evaluacionesService } from '../services/evaluacionesService';
import { useRemoverItemCualitativoJurado } from './useRemoverItemCualitativoJurado';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: {
    removerItemCualitativoJurado: vi.fn(),
  },
}));

const remover = vi.mocked(evaluacionesService.removerItemCualitativoJurado);

const KEY = { queryKey: ['evaluaciones', 'items-cualitativos-jurado'] };

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

function errorApi(errorCode: string, status: number) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Error', errorCode, message: 'x', status },
    status,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('useRemoverItemCualitativoJurado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invalida la lista con la key exacta tras remover', async () => {
    // Arrange
    remover.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRemoverItemCualitativoJurado(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate('i-1'));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(remover).toHaveBeenCalledWith('i-1');
    expect(invalidar).toHaveBeenCalledWith(KEY);
  });

  it('también invalida la lista ante el 422 de ítem no encontrado', async () => {
    // Arrange
    remover.mockRejectedValue(errorApi('ITEM_CUALITATIVO_JURADO_NO_ENCONTRADO', 422));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRemoverItemCualitativoJurado(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate('i-1'));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledWith(KEY);
  });

  it('no invalida la lista ante el 422 de ítem en uso', async () => {
    // Arrange
    remover.mockRejectedValue(errorApi('ITEM_CUALITATIVO_JURADO_EN_USO', 422));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRemoverItemCualitativoJurado(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate('i-1'));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
