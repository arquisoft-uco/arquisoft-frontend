import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { errorApi } from '../../../test-utils/errores-api';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { artefactosService } from '../services/artefactosService';
import { useMarcarRevisionResuelta } from './useMarcarRevisionResuelta';

vi.mock('../services/artefactosService', () => ({
  artefactosService: { marcarRevisionResuelta: vi.fn() },
}));

const marcar = vi.mocked(artefactosService.marcarRevisionResuelta);

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

describe('useMarcarRevisionResuelta', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama al service con el request e invalida las versiones al éxito', async () => {
    // Arrange
    marcar.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useMarcarRevisionResuelta(), { wrapper: Wrapper });

    // Act
    await act(() => result.current.mutateAsync({ revisionAsesorId: 'r-1' }));

    // Assert
    expect(marcar.mock.calls[0][0]).toEqual({ revisionAsesorId: 'r-1' });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'versiones-artefacto'] });
  });

  it('ante sin versión posterior no invalida nada', async () => {
    // Arrange
    marcar.mockRejectedValue(
      errorApi(422, { errorCode: 'REVISION_ASESOR_SIN_VERSION_POSTERIOR', message: 'x' }),
    );
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useMarcarRevisionResuelta(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate({ revisionAsesorId: 'r-1' }));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });

  it('ante otro error invalida versiones y el listado del estudiante', async () => {
    // Arrange
    marcar.mockRejectedValue(errorApi(422, { errorCode: 'REVISION_ASESOR_CERRADA', message: 'x' }));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useMarcarRevisionResuelta(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate({ revisionAsesorId: 'r-1' }));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'versiones-artefacto'] });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'estudiante'] });
  });
});
