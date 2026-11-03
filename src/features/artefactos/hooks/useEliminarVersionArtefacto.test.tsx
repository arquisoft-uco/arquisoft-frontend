import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { errorApi } from '../../../test-utils/errores-api';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { artefactosService } from '../services/artefactosService';
import { useEliminarVersionArtefacto } from './useEliminarVersionArtefacto';

vi.mock('../services/artefactosService', () => ({
  artefactosService: { eliminarVersionArtefacto: vi.fn() },
}));

const eliminar = vi.mocked(artefactosService.eliminarVersionArtefacto);

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

describe('useEliminarVersionArtefacto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('al éxito invalida las versiones y Mis artefactos', async () => {
    // Arrange
    eliminar.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useEliminarVersionArtefacto(), { wrapper: Wrapper });

    // Act
    await act(() => result.current.mutateAsync('v-1'));

    // Assert
    expect(eliminar.mock.calls[0][0]).toBe('v-1');
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'versiones-artefacto'] });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'estudiante'] });
  });

  it('al error invalida solo las versiones y expone el error', async () => {
    // Arrange
    eliminar.mockRejectedValue(
      errorApi(422, { errorCode: 'VERSION_ARTEFACTO_CON_REVISION', message: 'x' }),
    );
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useEliminarVersionArtefacto(), { wrapper: Wrapper });

    // Act
    await act(() => result.current.mutateAsync('v-1').catch(() => undefined));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'versiones-artefacto'] });
    expect(invalidar).not.toHaveBeenCalledWith({ queryKey: ['artefactos', 'estudiante'] });
  });
});
