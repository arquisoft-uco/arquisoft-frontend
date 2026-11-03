import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '../../../test-utils/render';
import { errorApi } from '../../../test-utils/errores-api';
import { artefactosService } from '../services/artefactosService';
import { useVincularEstudiantes } from './useVincularEstudiantes';

vi.mock('../services/artefactosService', () => ({
  artefactosService: { vincularEstudiantes: vi.fn() },
}));

const vincular = vi.mocked(artefactosService.vincularEstudiantes);

function error422(errorCode: string) {
  return errorApi(422, { status: 422, errorCode, message: 'del backend' });
}

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('useVincularEstudiantes', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('en éxito vincula y refresca la lista de estudiantes del artefacto', async () => {
    // Arrange
    vincular.mockResolvedValue(undefined);
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useVincularEstudiantes(), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    await act(async () => {
      await result.current.mutateAsync({ artefactoId: 'a-1', estudiantes: ['e-1'] });
    });

    // Assert
    expect(vincular).toHaveBeenCalledWith('a-1', { estudiantes: ['e-1'] });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'a-1', 'estudiantes'] });
  });

  it('un 422 de artefacto omitido refresca el listado y uno de ya vinculado la lista de estudiantes', async () => {
    // Arrange
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useVincularEstudiantes(), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    vincular.mockRejectedValueOnce(error422('ARTEFACTOS_ARTEFACTO_OMITIDO'));
    await act(async () => {
      await result.current
        .mutateAsync({ artefactoId: 'a-1', estudiantes: ['e-1'] })
        .catch(() => undefined);
    });

    // Assert
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'asesor'] });
    expect(invalidar).not.toHaveBeenCalledWith({ queryKey: ['artefactos', 'a-1', 'estudiantes'] });

    // Act
    vincular.mockRejectedValueOnce(error422('ESTUDIANTE_ARTEFACTO_ESTUDIANTE_YA_VINCULADO'));
    await act(async () => {
      await result.current
        .mutateAsync({ artefactoId: 'a-1', estudiantes: ['e-1'] })
        .catch(() => undefined);
    });

    // Assert
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'a-1', 'estudiantes'] });
  });
});
