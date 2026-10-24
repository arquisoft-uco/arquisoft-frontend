import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { EstadoEvaluacion } from '../models/fichas-perfil';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useEstadosEvaluacion } from './useEstadosEvaluacion';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: {
    getEstadosEvaluacion: vi.fn(),
  },
}));

const getEstadosEvaluacion = vi.mocked(fichasPerfilService.getEstadosEvaluacion);

const ESTADOS: EstadoEvaluacion[] = [
  { id: 'ev-1', nombre: 'En Evaluación', descripcion: 'Evaluación en curso' },
  { id: 'ev-2', nombre: 'Aprobada', descripcion: 'Ficha aprobada' },
];

function crearWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useEstadosEvaluacion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta getEstadosEvaluacion una vez y expone el catálogo en data', async () => {
    // Arrange
    getEstadosEvaluacion.mockResolvedValue(ESTADOS);

    // Act
    const { result } = renderHook(() => useEstadosEvaluacion(), { wrapper: crearWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(getEstadosEvaluacion).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(ESTADOS);
  });

  it('expone isError en true y data indefinido cuando el service rechaza', async () => {
    // Arrange
    getEstadosEvaluacion.mockRejectedValue(new Error('fallo de red'));

    // Act
    const { result } = renderHook(() => useEstadosEvaluacion(), { wrapper: crearWrapper() });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
