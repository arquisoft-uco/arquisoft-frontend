import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { AxiosError, AxiosHeaders } from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import type { ModificarItemCualitativoJuradoRequest } from '../models/ModificarItemCualitativoJuradoRequest';
import { evaluacionesService } from '../services/evaluacionesService';
import { useModificarItemCualitativoJurado } from './useModificarItemCualitativoJurado';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: {
    modificarItemCualitativoJurado: vi.fn(),
  },
}));

const modificar = vi.mocked(evaluacionesService.modificarItemCualitativoJurado);

const request: ModificarItemCualitativoJuradoRequest = {
  itemId: 'i-1',
  descripcion: 'Nueva descripción.',
};

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

describe('useModificarItemCualitativoJurado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invalida la lista con la key exacta tras modificar', async () => {
    // Arrange
    modificar.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useModificarItemCualitativoJurado(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(request));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(modificar).toHaveBeenCalledWith(request);
    expect(invalidar).toHaveBeenCalledWith(KEY);
  });

  it('también invalida la lista ante el 422 de ítem no encontrado', async () => {
    // Arrange
    modificar.mockRejectedValue(errorApi('ITEM_CUALITATIVO_JURADO_NO_ENCONTRADO', 422));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useModificarItemCualitativoJurado(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(request));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledWith(KEY);
  });

  it('no invalida la lista ante cualquier otro error', async () => {
    // Arrange
    modificar.mockRejectedValue(new Error('500'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useModificarItemCualitativoJurado(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(request));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
