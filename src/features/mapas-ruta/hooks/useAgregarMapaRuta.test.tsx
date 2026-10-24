import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { mapasRutaService } from '../services/mapasRutaService';
import { useAgregarMapaRuta } from './useAgregarMapaRuta';

vi.mock('../services/mapasRutaService', () => ({
  mapasRutaService: { agregarMapaRuta: vi.fn() },
}));

const agregarMapaRuta = vi.mocked(mapasRutaService.agregarMapaRuta);

const REQUEST = { proyectoGradoId: 'p-1', fechaInicio: '2026-10-22', fechaFin: '2026-12-01' };

function crearContexto() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } },
  });
  const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { Wrapper, invalidar };
}

describe('useAgregarMapaRuta', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('crea el mapa e invalida solo la key mapas-ruta en éxito', async () => {
    // Arrange
    agregarMapaRuta.mockResolvedValue({ id: 'm-1' });
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useAgregarMapaRuta(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(REQUEST));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(agregarMapaRuta.mock.calls[0][0]).toEqual(REQUEST);
    expect(invalidar).toHaveBeenCalledTimes(1);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['mapas-ruta'] });
  });

  it('no invalida nada cuando el service rechaza', async () => {
    // Arrange
    agregarMapaRuta.mockRejectedValue(new Error('422'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useAgregarMapaRuta(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(REQUEST));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
