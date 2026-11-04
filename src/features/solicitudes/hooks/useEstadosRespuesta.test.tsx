import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useEstadosRespuesta } from './useEstadosRespuesta';
import { solicitudesService } from '../services/solicitudesService';
import type { EstadoRespuesta } from '../models/EstadoRespuesta';

vi.mock('../services/solicitudesService', () => ({
  solicitudesService: { getEstadosRespuesta: vi.fn() },
}));

const ESTADOS: EstadoRespuesta[] = [
  { id: 'APROBADA', nombre: 'Aprobada', descripcion: 'Aceptada' },
  { id: 'EN_REVISION', nombre: 'En revisión', descripcion: 'Pendiente' },
];

function crearWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useEstadosRespuesta', () => {
  beforeEach(() => {
    vi.mocked(solicitudesService.getEstadosRespuesta).mockReset();
  });

  it('consulta el catálogo una vez y expone los estados', async () => {
    // Arrange
    vi.mocked(solicitudesService.getEstadosRespuesta).mockResolvedValue(ESTADOS);

    // Act
    const { result } = renderHook(() => useEstadosRespuesta(), { wrapper: crearWrapper() });

    // Assert
    await waitFor(() => expect(result.current.data).toEqual(ESTADOS));
    expect(solicitudesService.getEstadosRespuesta).toHaveBeenCalledTimes(1);
  });

  it('expone isError cuando el service falla', async () => {
    // Arrange
    vi.mocked(solicitudesService.getEstadosRespuesta).mockRejectedValue(new Error('500'));

    // Act
    const { result } = renderHook(() => useEstadosRespuesta(), { wrapper: crearWrapper() });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
