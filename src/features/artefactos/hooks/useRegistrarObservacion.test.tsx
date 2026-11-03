import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { errorApi } from '../../../test-utils/errores-api';
import { artefactosService } from '../services/artefactosService';
import { useRegistrarObservacion } from './useRegistrarObservacion';

vi.mock('../services/artefactosService', () => ({
  artefactosService: { registrarObservacion: vi.fn() },
}));

const registrar = vi.mocked(artefactosService.registrarObservacion);

const CLAVE_OBSERVACIONES = ['artefactos', 'revisiones-asesor', 'r-1', 'observaciones'];
const CLAVE_VERSIONES = ['artefactos', 'versiones-artefacto'];
const CLAVE_ASESOR = ['artefactos', 'asesor'];

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('useRegistrarObservacion', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('en éxito manda la descripción a la revisión e invalida solo las observaciones', async () => {
    // Arrange
    registrar.mockResolvedValue({ id: 'o-1' });
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useRegistrarObservacion(), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    await act(async () => {
      await result.current.mutateAsync({ revisionAsesorId: 'r-1', descripcion: 'Falta algo' });
    });

    // Assert
    expect(registrar).toHaveBeenCalledWith('r-1', { descripcion: 'Falta algo' });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_OBSERVACIONES });
    expect(invalidar).not.toHaveBeenCalledWith({ queryKey: CLAVE_VERSIONES });
  });

  it('un 422 de revisión ya no gestionable invalida las tres claves; la duplicada no invalida', async () => {
    // Arrange
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useRegistrarObservacion(), {
      wrapper: crearWrapper(queryClient),
    });
    const variables = { revisionAsesorId: 'r-1', descripcion: 'x' };

    // Act
    registrar.mockRejectedValueOnce(
      errorApi(422, { status: 422, errorCode: 'OBSERVACION_DUPLICADA', message: 'x' }),
    );
    act(() => result.current.mutate(variables));
    await waitFor(() => expect(result.current.isError).toBe(true));
    const trasDuplicada = invalidar.mock.calls.length;

    registrar.mockRejectedValueOnce(
      errorApi(422, {
        status: 422,
        errorCode: 'REVISION_ASESOR_NO_ADMITE_OBSERVACIONES',
        message: 'x',
      }),
    );
    act(() => result.current.mutate(variables));
    await waitFor(() => expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_ASESOR }));

    // Assert
    expect(trasDuplicada).toBe(0);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_OBSERVACIONES });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_VERSIONES });
  });
});
