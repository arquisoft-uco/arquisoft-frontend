import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useObservacionesEvaluacionMiFicha } from './useObservacionesEvaluacionMiFicha';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: { consultarObservacionesEvaluacionMiFicha: vi.fn() },
}));

const consultar = vi.mocked(fichasPerfilService.consultarObservacionesEvaluacionMiFicha);

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useObservacionesEvaluacionMiFicha', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve las observaciones de la evaluación y las guarda bajo la key del plan', async () => {
    // Arrange
    const observaciones = [
      { id: 'o-1', evaluacionFichaPerfilId: 'ev-1', observacion: 'Ajustar el alcance' },
    ];
    consultar.mockResolvedValue(observaciones);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    // Act
    const { result } = renderHook(() => useObservacionesEvaluacionMiFicha('f-1', 'ev-1'), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    await waitFor(() => expect(result.current.cargado).toBe(true));
    expect(consultar).toHaveBeenCalledWith('ev-1');
    expect(result.current.observaciones).toEqual(observaciones);
    expect(
      queryClient.getQueryData([
        'fichas-perfil',
        'estudiante',
        'f-1',
        'evaluaciones',
        'ev-1',
        'observaciones',
      ]),
    ).toEqual(observaciones);
  });

  it('no llama al service cuando no hay evaluación', () => {
    // Arrange
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    // Act
    const { result } = renderHook(() => useObservacionesEvaluacionMiFicha('f-1', ''), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    expect(consultar).not.toHaveBeenCalled();
    expect(result.current.observaciones).toEqual([]);
  });

  it('propaga el error del service', async () => {
    // Arrange
    consultar.mockRejectedValue(new Error('fallo'));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    // Act
    const { result } = renderHook(() => useObservacionesEvaluacionMiFicha('f-1', 'ev-1'), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.cargado).toBe(false);
  });
});
