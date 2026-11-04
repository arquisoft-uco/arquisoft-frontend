import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { EstadoRevisionAsesor } from '../models/artefactos';
import { artefactosService } from '../services/artefactosService';
import { useEstadosRevisionAsesor } from './useEstadosRevisionAsesor';

vi.mock('../services/artefactosService', () => ({
  artefactosService: {
    getEstadosRevisionAsesor: vi.fn(),
  },
}));

const getEstadosRevisionAsesor = vi.mocked(artefactosService.getEstadosRevisionAsesor);

const ESTADOS: EstadoRevisionAsesor[] = [
  { id: 'PENDIENTE', nombre: 'Pendiente', descripcion: 'Nueva revisión elaborada por el asesor' },
  { id: 'CERRADA', nombre: 'Cerrada', descripcion: 'Indica que el asesor cerró la revisión' },
];

function crearWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useEstadosRevisionAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta getEstadosRevisionAsesor una vez y expone el catálogo en data', async () => {
    // Arrange
    getEstadosRevisionAsesor.mockResolvedValue(ESTADOS);

    // Act
    const { result } = renderHook(() => useEstadosRevisionAsesor(), { wrapper: crearWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(getEstadosRevisionAsesor).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(ESTADOS);
  });

  it('expone isError en true y data indefinido cuando el service rechaza', async () => {
    // Arrange
    getEstadosRevisionAsesor.mockRejectedValue(new Error('fallo de red'));

    // Act
    const { result } = renderHook(() => useEstadosRevisionAsesor(), { wrapper: crearWrapper() });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
