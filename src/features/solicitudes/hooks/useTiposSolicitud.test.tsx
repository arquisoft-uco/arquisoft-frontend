import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useTiposSolicitud } from './useTiposSolicitud';
import { solicitudesService } from '../services/solicitudesService';
import type { TipoSolicitud } from '../models/TipoSolicitud';

vi.mock('../services/solicitudesService', () => ({
  solicitudesService: { getTiposSolicitud: vi.fn() },
}));

const TIPOS: TipoSolicitud[] = [
  { id: 'CAMBIO_DE_ASESOR', nombre: 'Cambio de Asesor', descripcion: 'd' },
];

function crearWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useTiposSolicitud', () => {
  beforeEach(() => {
    vi.mocked(solicitudesService.getTiposSolicitud).mockReset();
  });

  it('consulta el catálogo una vez y expone los tipos', async () => {
    // Arrange
    vi.mocked(solicitudesService.getTiposSolicitud).mockResolvedValue(TIPOS);

    // Act
    const { result } = renderHook(() => useTiposSolicitud(), { wrapper: crearWrapper() });

    // Assert
    await waitFor(() => expect(result.current.data).toEqual(TIPOS));
    expect(solicitudesService.getTiposSolicitud).toHaveBeenCalledTimes(1);
  });
});
