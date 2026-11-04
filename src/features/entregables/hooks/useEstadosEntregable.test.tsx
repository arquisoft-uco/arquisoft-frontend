import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { EstadoEntregable } from '../models/entregables';
import { entregablesService } from '../services/entregablesService';
import { useEstadosEntregable } from './useEstadosEntregable';

vi.mock('../services/entregablesService', () => ({
  entregablesService: {
    getEstadosEntregable: vi.fn(),
  },
}));

const getEstadosEntregable = vi.mocked(entregablesService.getEstadosEntregable);

const ESTADOS: EstadoEntregable[] = [
  { id: 'APROBADO', nombre: 'Aprobado', descripcion: 'El entregable fue aprobado' },
  { id: 'RECHAZADO', nombre: 'Rechazado', descripcion: 'El entregable fue rechazado' },
];

function crearWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useEstadosEntregable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta getEstadosEntregable una vez y expone el catálogo en data', async () => {
    // Arrange
    getEstadosEntregable.mockResolvedValue(ESTADOS);

    // Act
    const { result } = renderHook(() => useEstadosEntregable(), { wrapper: crearWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(getEstadosEntregable).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(ESTADOS);
  });

  it('expone isError en true y data indefinido cuando el service rechaza', async () => {
    // Arrange
    getEstadosEntregable.mockRejectedValue(new Error('fallo de red'));

    // Act
    const { result } = renderHook(() => useEstadosEntregable(), { wrapper: crearWrapper() });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
