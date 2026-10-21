import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { EvaluacionFichaPerfil } from '../models/fichas-perfil';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useEvaluacionFicha } from './useEvaluacionFicha';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: {
    getEvaluacionFicha: vi.fn(),
  },
}));

const consultar = vi.mocked(fichasPerfilService.getEvaluacionFicha);

const evaluacion: EvaluacionFichaPerfil = {
  id: 'ev-1',
  fichaPerfilId: 'f-1',
  fechaCreacion: '2026-10-01',
  estadoEvaluacionId: null,
  estadoEvaluacionNombre: null,
};

function crearWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useEvaluacionFicha', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta las evaluaciones de la ficha recibida y expone la lista', async () => {
    // Arrange
    consultar.mockResolvedValue([evaluacion]);

    // Act
    const { result } = renderHook(() => useEvaluacionFicha('f-1'), { wrapper: crearWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith('f-1');
    expect(result.current.data).toEqual([evaluacion]);
  });

  it('expone el error cuando el service falla', async () => {
    // Arrange
    consultar.mockRejectedValue(new Error('fallo de red'));

    // Act
    const { result } = renderHook(() => useEvaluacionFicha('f-1'), { wrapper: crearWrapper() });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
