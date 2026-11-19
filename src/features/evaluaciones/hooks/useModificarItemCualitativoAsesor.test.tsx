import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { AxiosError, AxiosHeaders } from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import type { ModificarItemCualitativoAsesorRequest } from '../models/ModificarItemCualitativoAsesorRequest';
import { evaluacionesService } from '../services/evaluacionesService';
import { useModificarItemCualitativoAsesor } from './useModificarItemCualitativoAsesor';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: {
    modificarItemCualitativoAsesor: vi.fn(),
  },
}));

const modificar = vi.mocked(evaluacionesService.modificarItemCualitativoAsesor);

const request: ModificarItemCualitativoAsesorRequest = {
  itemId: 'i-1',
  descripcion: 'Nueva descripción.',
};

const KEY = { queryKey: ['evaluaciones', 'items-cualitativos-asesor'] };

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

describe('useModificarItemCualitativoAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invalida la lista con la key exacta tras modificar', async () => {
    // Arrange
    modificar.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useModificarItemCualitativoAsesor(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(request));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(modificar).toHaveBeenCalledWith(request);
    expect(invalidar).toHaveBeenCalledWith(KEY);
  });

  it('también invalida la lista ante el 422 de ítem no encontrado', async () => {
    // Arrange
    modificar.mockRejectedValue(errorApi('ITEM_CUALITATIVO_ASESOR_NO_ENCONTRADO', 422));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useModificarItemCualitativoAsesor(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(request));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledWith(KEY);
  });
});
