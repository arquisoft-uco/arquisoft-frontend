import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { artefactosService } from '../services/artefactosService';
import { useCambiarAsesorArtefacto } from './useCambiarAsesorArtefacto';

vi.mock('../services/artefactosService', () => ({
  artefactosService: { cambiarAsesorArtefacto: vi.fn() },
}));

const cambiar = vi.mocked(artefactosService.cambiarAsesorArtefacto);

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

describe('useCambiarAsesorArtefacto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama al service con la petición e invalida el listado de artefactos asignados', async () => {
    // Arrange
    cambiar.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useCambiarAsesorArtefacto(), { wrapper: Wrapper });

    // Act
    await act(() => result.current.mutateAsync({ artefactoId: 'art-1', asesorId: 'a-2' }));

    // Assert
    expect(cambiar).toHaveBeenCalledWith({ artefactoId: 'art-1', asesorId: 'a-2' });
    expect(invalidar).toHaveBeenCalledWith({
      queryKey: ['artefactos', 'asesor', 'artefactos-asignados'],
    });
  });

  it('si el service falla no invalida el listado y expone el error', async () => {
    // Arrange
    cambiar.mockRejectedValue(new Error('422'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useCambiarAsesorArtefacto(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate({ artefactoId: 'art-1', asesorId: 'a-2' }));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
