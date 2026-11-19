import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useObservacionesEvaluacionAsesor } from './useObservacionesEvaluacionAsesor';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: { consultarObservacionesEvaluacionAsesor: vi.fn() },
}));

const consultar = vi.mocked(fichasPerfilService.consultarObservacionesEvaluacionAsesor);

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useObservacionesEvaluacionAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve las observaciones y las guarda bajo la key del plan', async () => {
    // Arrange
    const observaciones = [
      { id: 'o-1', evaluacionFichaPerfilId: 'ev-1', observacion: 'Ajustar el alcance' },
    ];
    consultar.mockResolvedValue(observaciones);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    // Act
    const { result } = renderHook(() => useObservacionesEvaluacionAsesor('f-1', 'ev-1'), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    await waitFor(() => expect(result.current.cargado).toBe(true));
    expect(consultar).toHaveBeenCalledWith('ev-1');
    expect(result.current.observaciones).toEqual(observaciones);
    expect(
      queryClient.getQueryData([
        'fichas-perfil',
        'f-1',
        'evaluacion',
        'ev-1',
        'observaciones-asesor',
      ]),
    ).toEqual(observaciones);
  });

  it('devuelve lista vacía cuando la evaluación no tiene observaciones', async () => {
    // Arrange
    consultar.mockResolvedValue([]);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    // Act
    const { result } = renderHook(() => useObservacionesEvaluacionAsesor('f-1', 'ev-1'), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    await waitFor(() => expect(result.current.cargado).toBe(true));
    expect(result.current.observaciones).toEqual([]);
  });

  it('no llama al service cuando no hay evaluación', () => {
    // Arrange
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    // Act
    const { result } = renderHook(() => useObservacionesEvaluacionAsesor('f-1', ''), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    expect(consultar).not.toHaveBeenCalled();
    expect(result.current.observaciones).toEqual([]);
  });

  it('expone el error del service', async () => {
    // Arrange
    consultar.mockRejectedValue(new Error('fallo'));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    // Act
    const { result } = renderHook(() => useObservacionesEvaluacionAsesor('f-1', 'ev-1'), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.cargado).toBe(false);
  });
});
