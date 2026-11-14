import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { AxiosError, AxiosHeaders } from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import type { ModificarObservacionItemJuradoRequest } from '../models/ModificarObservacionItemJuradoRequest';
import { evaluacionesService } from '../services/evaluacionesService';
import { useModificarObservacionItemJurado } from './useModificarObservacionItemJurado';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: {
    modificarObservacionItemJurado: vi.fn(),
  },
}));

const modificar = vi.mocked(evaluacionesService.modificarObservacionItemJurado);

const request: ModificarObservacionItemJuradoRequest = {
  observacionId: 'obs-1',
  descripcion: 'Nuevo texto',
};

const KEY = { queryKey: ['evaluaciones', 'jurado', 'observaciones-item'] };

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

describe('useModificarObservacionItemJurado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invalida las observaciones con la key exacta tras modificar', async () => {
    // Arrange
    modificar.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useModificarObservacionItemJurado(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(request));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(modificar).toHaveBeenCalledWith(request);
    expect(invalidar).toHaveBeenCalledWith(KEY);
  });

  it('también invalida ante el 422 de observación no encontrada', async () => {
    // Arrange
    modificar.mockRejectedValue(errorApi('OBSERVACION_ITEM_JURADO_NO_ENCONTRADA', 422));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useModificarObservacionItemJurado(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(request));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledWith(KEY);
  });

  it('no invalida ante cualquier otro error', async () => {
    // Arrange
    modificar.mockRejectedValue(errorApi('OBSERVACION_ITEM_JURADO_DESCRIPCION_DUPLICADA', 422));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useModificarObservacionItemJurado(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(request));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
