import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { errorApi } from '../../../test-utils/errores-api';
import { artefactosService } from '../services/artefactosService';
import { useRemoverEstudianteArtefacto } from './useRemoverEstudianteArtefacto';

vi.mock('../services/artefactosService', () => ({
  artefactosService: { removerEstudianteArtefacto: vi.fn() },
}));

const remover = vi.mocked(artefactosService.removerEstudianteArtefacto);
const req = { artefactoId: 'a-1', estudianteId: 'e-1' };

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

describe('useRemoverEstudianteArtefacto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama al service con ambos ids e invalida los estudiantes del artefacto', async () => {
    // Arrange
    remover.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRemoverEstudianteArtefacto(), { wrapper: Wrapper });

    // Act
    await act(() => result.current.mutateAsync(req));

    // Assert
    expect(remover.mock.calls[0][0]).toEqual(req);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'a-1', 'estudiantes'] });
  });

  it('si el 422 es de estudiante no vinculado invalida solo la lista de estudiantes', async () => {
    // Arrange
    remover.mockRejectedValue(
      errorApi(422, {
        status: 422,
        errorCode: 'ESTUDIANTE_ARTEFACTO_ESTUDIANTE_NO_VINCULADO_ARTEFACTO',
      }),
    );
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRemoverEstudianteArtefacto(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(req));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    await waitFor(() =>
      expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'a-1', 'estudiantes'] }),
    );
    expect(invalidar).not.toHaveBeenCalledWith({ queryKey: ['artefactos', 'asesor'] });
  });

  it('si el artefacto ya no está disponible invalida la lista de estudiantes y el listado del asesor', async () => {
    // Arrange
    remover.mockRejectedValue(
      errorApi(422, { status: 422, errorCode: 'ARTEFACTOS_ARTEFACTO_OMITIDO' }),
    );
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRemoverEstudianteArtefacto(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(req));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    await waitFor(() => {
      expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'a-1', 'estudiantes'] });
      expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'asesor'] });
    });
  });

  it('ante un error sin código no invalida nada y expone el error', async () => {
    // Arrange
    remover.mockRejectedValue(new Error('red'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRemoverEstudianteArtefacto(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(req));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
