import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useEstadosObservacionRevision } from './useEstadosObservacionRevision';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: {
    getEstadosObservacionRevision: vi.fn(),
  },
}));

const getEstados = vi.mocked(fichasPerfilService.getEstadosObservacionRevision);

const ESTADOS = [
  { id: 'PENDIENTE', nombre: 'Pendiente', descripcion: 'Aún no se atiende' },
  { id: 'CERRADO', nombre: 'Cerrado', descripcion: 'Ya se atendió' },
];

function crearWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useEstadosObservacionRevision', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta el catálogo y lo expone en data', async () => {
    // Arrange
    getEstados.mockResolvedValueOnce(ESTADOS);

    // Act
    const { result } = renderHook(() => useEstadosObservacionRevision(), {
      wrapper: crearWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(getEstados).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(ESTADOS);
  });

  it('expone data vacío cuando el catálogo no trae estados', async () => {
    // Arrange
    getEstados.mockResolvedValueOnce([]);

    // Act
    const { result } = renderHook(() => useEstadosObservacionRevision(), {
      wrapper: crearWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(result.current.data).toEqual([]);
  });

  it('expone isError y data indefinido cuando el service rechaza', async () => {
    // Arrange
    getEstados.mockRejectedValueOnce(new Error('fallo de red'));

    // Act
    const { result } = renderHook(() => useEstadosObservacionRevision(), {
      wrapper: crearWrapper(),
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
