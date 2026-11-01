import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '../../../test-utils/render';
import { errorApi } from '../../../test-utils/errores-api';
import { artefactosService } from '../services/artefactosService';
import { useRemoverEstudiante } from './useRemoverEstudiante';

vi.mock('../services/artefactosService', () => ({
  artefactosService: { removerEstudiante: vi.fn() },
}));

const remover = vi.mocked(artefactosService.removerEstudiante);

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

describe('useRemoverEstudiante', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('en éxito quita por estudianteId y refresca la lista de estudiantes del artefacto', async () => {
    // Arrange
    remover.mockResolvedValue(undefined);
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useRemoverEstudiante(), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    await act(async () => {
      await result.current.mutateAsync({ artefactoId: 'a-1', estudianteId: 'e-1' });
    });

    // Assert
    expect(remover).toHaveBeenCalledWith('a-1', 'e-1');
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'a-1', 'estudiantes'] });
  });

  it('un 422 de no vinculado refresca la lista y uno de artefacto omitido refresca el listado', async () => {
    // Arrange
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useRemoverEstudiante(), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    remover.mockRejectedValueOnce(
      error422('ESTUDIANTE_ARTEFACTO_ESTUDIANTE_NO_VINCULADO_ARTEFACTO'),
    );
    await act(async () => {
      await result.current
        .mutateAsync({ artefactoId: 'a-1', estudianteId: 'e-1' })
        .catch(() => undefined);
    });

    // Assert
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'a-1', 'estudiantes'] });
    expect(invalidar).not.toHaveBeenCalledWith({ queryKey: ['artefactos', 'asesor'] });

    // Act
    remover.mockRejectedValueOnce(error422('ARTEFACTOS_ARTEFACTO_OMITIDO'));
    await act(async () => {
      await result.current
        .mutateAsync({ artefactoId: 'a-1', estudianteId: 'e-1' })
        .catch(() => undefined);
    });

    // Assert
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'asesor'] });
  });
});
