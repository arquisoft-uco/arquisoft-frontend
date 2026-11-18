import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { AxiosError, AxiosHeaders } from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import type { RegistrarObservacionItemAsesorRequest } from '../models/RegistrarObservacionItemAsesorRequest';
import { evaluacionesService } from '../services/evaluacionesService';
import { useRegistrarObservacionItemAsesor } from './useRegistrarObservacionItemAsesor';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: {
    registrarObservacionItemAsesor: vi.fn(),
  },
}));

const registrar = vi.mocked(evaluacionesService.registrarObservacionItemAsesor);

const request: RegistrarObservacionItemAsesorRequest = {
  evaluacionCuantitativaAsesorId: 'ec-1',
  descripcion: 'Falta rigor',
};

const KEY = { queryKey: ['evaluaciones', 'asesor', 'observaciones-cuantitativa'] };

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

describe('useRegistrarObservacionItemAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invalida las observaciones del asesor con la key exacta tras registrar', async () => {
    // Arrange
    registrar.mockResolvedValue({ id: 'obs-1' });
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRegistrarObservacionItemAsesor(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(request));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(registrar).toHaveBeenCalledWith(request);
    expect(invalidar).toHaveBeenCalledWith(KEY);
  });

  it('también invalida ante el 422 de evaluación no encontrada', async () => {
    // Arrange
    registrar.mockRejectedValue(errorApi('OBSERVACION_ITEM_ASESOR_EVALUACION_NO_ENCONTRADA', 422));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRegistrarObservacionItemAsesor(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(request));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledWith(KEY);
  });

  it('no invalida ante cualquier otro error', async () => {
    // Arrange
    registrar.mockRejectedValue(errorApi('OBSERVACION_ITEM_ASESOR_DESCRIPCION_DUPLICADA', 422));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRegistrarObservacionItemAsesor(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(request));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
