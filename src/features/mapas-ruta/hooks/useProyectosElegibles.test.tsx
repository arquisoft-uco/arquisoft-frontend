import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { mapasRutaService } from '../services/mapasRutaService';
import { useProyectosElegibles } from './useProyectosElegibles';

vi.mock('../services/mapasRutaService', () => ({
  mapasRutaService: { consultarProyectosElegibles: vi.fn() },
}));

const consultar = vi.mocked(mapasRutaService.consultarProyectosElegibles);

function Wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useProyectosElegibles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('aplana la primera página y cargarMas añade la siguiente hasta agotar', async () => {
    // Arrange
    consultar
      .mockResolvedValueOnce({ proyectos: [{ id: 'p-1', titulo: 'A' }], siguientePagina: 1 })
      .mockResolvedValueOnce({ proyectos: [{ id: 'p-2', titulo: 'B' }], siguientePagina: null });
    const { result } = renderHook(() => useProyectosElegibles(), { wrapper: Wrapper });

    // Assert
    await waitFor(() => expect(result.current.proyectos).toHaveLength(1));
    expect(consultar).toHaveBeenCalledWith(0);
    expect(result.current.hayMas).toBe(true);

    // Act
    await act(async () => {
      await result.current.cargarMas();
    });

    // Assert
    await waitFor(() => expect(result.current.proyectos.map((p) => p.id)).toEqual(['p-1', 'p-2']));
    expect(consultar).toHaveBeenLastCalledWith(1);
    expect(result.current.hayMas).toBe(false);
  });

  it('con una lista vacía no hay proyectos ni más páginas', async () => {
    // Arrange
    consultar.mockResolvedValue({ proyectos: [], siguientePagina: null });

    // Act
    const { result } = renderHook(() => useProyectosElegibles(), { wrapper: Wrapper });

    // Assert
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.proyectos).toEqual([]);
    expect(result.current.hayMas).toBe(false);
  });

  it('expone el error cuando el service rechaza', async () => {
    // Arrange
    consultar.mockRejectedValue(new Error('500'));

    // Act
    const { result } = renderHook(() => useProyectosElegibles(), { wrapper: Wrapper });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.proyectos).toEqual([]);
  });
});
