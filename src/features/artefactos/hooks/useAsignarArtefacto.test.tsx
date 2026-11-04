import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { artefactosService } from '../services/artefactosService';
import { useAsignarArtefacto } from './useAsignarArtefacto';

vi.mock('../services/artefactosService', () => ({
  artefactosService: { asignarArtefacto: vi.fn() },
}));

const asignar = vi.mocked(artefactosService.asignarArtefacto);

const REQ = { proyectoGrado: 'p-1', versionRepositorioArtefacto: 'v-1', estudiantes: ['e-1'] };

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('useAsignarArtefacto', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('en éxito invalida el listado del asesor por su prefijo', async () => {
    // Arrange
    asignar.mockResolvedValue({ id: 'a-1' });
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useAsignarArtefacto(), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    await act(async () => {
      await result.current.mutateAsync(REQ);
    });

    // Assert
    expect(asignar).toHaveBeenCalledWith(REQ);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'asesor'] });
  });

  it('en error no invalida nada y expone el fallo', async () => {
    // Arrange
    asignar.mockRejectedValue(new Error('fallo'));
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useAsignarArtefacto(), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    act(() => result.current.mutate(REQ));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
