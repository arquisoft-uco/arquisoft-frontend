import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { ObservacionRevision } from '../models/ObservacionRevision';
import { artefactosService } from '../services/artefactosService';
import { useObservacionesRevision } from './useObservacionesRevision';

vi.mock('../services/artefactosService', () => ({
  artefactosService: {
    getObservacionesRevision: vi.fn(),
  },
}));

const consultar = vi.mocked(artefactosService.getObservacionesRevision);

const observacion: ObservacionRevision = {
  id: 'o-1',
  revisionAsesorId: 'r-1',
  descripcion: 'Falta el diagrama',
  estadoId: 'NUEVA',
  estadoNombre: 'Nueva',
};

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('useObservacionesRevision', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('consulta las observaciones de la revisión y las guarda bajo la key de la feature', async () => {
    // Arrange
    consultar.mockResolvedValue([observacion]);

    // Act
    const { result } = renderHook(() => useObservacionesRevision('r-1'), {
      wrapper: crearWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith('r-1');
    expect(result.current.data).toEqual([observacion]);
    expect(queryClient.getQueryCache().getAll()[0].queryKey).toEqual([
      'artefactos',
      'revisiones-asesor',
      'r-1',
      'observaciones',
    ]);
  });

  it('sin id no consulta al service', () => {
    // Act
    const { result } = renderHook(() => useObservacionesRevision(null), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    expect(consultar).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe('idle');
  });

  it('expone el error cuando el service falla', async () => {
    // Arrange
    consultar.mockRejectedValue(new Error('fallo'));

    // Act
    const { result } = renderHook(() => useObservacionesRevision('r-1'), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
