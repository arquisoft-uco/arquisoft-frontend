import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useEvaluacionesFichaCoordinador } from './useEvaluacionesFichaCoordinador';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: { consultarEvaluacionesFichaCoordinador: vi.fn() },
}));

const consultar = vi.mocked(fichasPerfilService.consultarEvaluacionesFichaCoordinador);

function evaluacion(id: string, fechaCreacion: string) {
  return {
    id,
    fichaPerfilId: 'f-1',
    fechaCreacion,
    estadoEvaluacionId: 'APROBADA',
    estadoEvaluacionNombre: 'Aprobada',
    representante: { id: 'r-1', nombre: 'Rosa Gil' },
  };
}

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function crearQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe('useEvaluacionesFichaCoordinador', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('con id consulta el service y conserva el orden recibido bajo la key de la ficha', async () => {
    // Arrange
    const primera = evaluacion('ev-1', '2026-09-01T10:00:00Z');
    const segunda = evaluacion('ev-2', '2026-09-05T10:00:00Z');
    consultar.mockResolvedValue([primera, segunda]);
    const queryClient = crearQueryClient();

    // Act
    const { result } = renderHook(() => useEvaluacionesFichaCoordinador('f-1'), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(consultar).toHaveBeenCalledWith('f-1');
    expect(result.current.data).toEqual([primera, segunda]);
    expect(queryClient.getQueryData(['fichas-perfil', 'f-1', 'evaluaciones-coordinador'])).toEqual([
      primera,
      segunda,
    ]);
  });

  it('sin id no llama al service', () => {
    // Act
    renderHook(() => useEvaluacionesFichaCoordinador(null), {
      wrapper: crearWrapper(crearQueryClient()),
    });

    // Assert
    expect(consultar).not.toHaveBeenCalled();
  });

  it('expone el error cuando falla la consulta', async () => {
    // Arrange
    consultar.mockRejectedValue(new Error('fallo'));

    // Act
    const { result } = renderHook(() => useEvaluacionesFichaCoordinador('f-1'), {
      wrapper: crearWrapper(crearQueryClient()),
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
