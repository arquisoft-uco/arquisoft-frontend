import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import { repositorioArtefactosService } from '../services/repositorioArtefactosService';
import { useGenerarRepositorioArtefacto } from './useGenerarRepositorioArtefacto';

vi.mock('../services/repositorioArtefactosService', () => ({
  repositorioArtefactosService: { generarRepositorio: vi.fn() },
}));

const generar = vi.mocked(repositorioArtefactosService.generarRepositorio);
const CUERPO = { nombreRepositorio: 'Repositorio Alfa', descripcion: 'Artefactos' };

describe('useGenerarRepositorioArtefacto', () => {
  let queryClient: QueryClient;

  function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('envía el cuerpo al service e invalida el listado del administrador al terminar', async () => {
    // Arrange
    generar.mockResolvedValue({ id: 'r-9' });
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useGenerarRepositorioArtefacto(), { wrapper });

    // Act
    result.current.mutate(CUERPO);

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(generar).toHaveBeenCalledWith(CUERPO);
    expect(invalidar).toHaveBeenCalledWith({
      queryKey: ['repositorio-artefactos', 'administrador'],
    });
  });

  it('no invalida el listado cuando el service falla', async () => {
    // Arrange
    generar.mockRejectedValue(new Error('falló'));
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useGenerarRepositorioArtefacto(), { wrapper });

    // Act
    result.current.mutate(CUERPO);

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
