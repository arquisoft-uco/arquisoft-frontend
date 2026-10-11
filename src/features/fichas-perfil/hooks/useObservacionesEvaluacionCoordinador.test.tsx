import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useObservacionesEvaluacionCoordinador } from './useObservacionesEvaluacionCoordinador';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: { consultarObservacionesEvaluacionesFichaCoordinador: vi.fn() },
}));

const consultar = vi.mocked(fichasPerfilService.consultarObservacionesEvaluacionesFichaCoordinador);

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useObservacionesEvaluacionCoordinador', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve solo las observaciones de la evaluación pedida, en el orden recibido, bajo la key del plan', async () => {
    // Arrange
    const todas = [
      { id: 'o-1', evaluacionFichaPerfilId: 'ev-1', observacion: 'Primera' },
      { id: 'o-2', evaluacionFichaPerfilId: 'ev-2', observacion: 'Ajena' },
      { id: 'o-3', evaluacionFichaPerfilId: 'ev-1', observacion: 'Segunda' },
    ];
    consultar.mockResolvedValue(todas);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    // Act
    const { result } = renderHook(() => useObservacionesEvaluacionCoordinador('f-1', 'ev-1'), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    await waitFor(() => expect(result.current.cargado).toBe(true));
    expect(consultar).toHaveBeenCalledWith('f-1');
    expect(result.current.observaciones).toEqual([todas[0], todas[2]]);
    expect(queryClient.getQueryData(['fichas-perfil', 'f-1', 'observaciones-coordinador'])).toEqual(
      todas,
    );
  });

  it('con una ficha sin observaciones queda cargado y vacío', async () => {
    // Arrange
    consultar.mockResolvedValue([]);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    // Act
    const { result } = renderHook(() => useObservacionesEvaluacionCoordinador('f-1', 'ev-1'), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    await waitFor(() => expect(result.current.cargado).toBe(true));
    expect(result.current.observaciones).toEqual([]);
  });

  it('no llama al service sin ficha', () => {
    // Arrange
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    // Act
    const { result } = renderHook(() => useObservacionesEvaluacionCoordinador('', 'ev-1'), {
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
    const { result } = renderHook(() => useObservacionesEvaluacionCoordinador('f-1', 'ev-1'), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.cargado).toBe(false);
  });
});
