import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import type { Solicitud } from '../models/Solicitud';
import { solicitudesService } from '../services/solicitudesService';
import {
  SOLICITUDES_AMPLIACION_PLAZO_RECIBIDAS_QUERY_KEY,
  useSolicitudesAmpliacionPlazoRecibidas,
} from './useSolicitudesAmpliacionPlazoRecibidas';

vi.mock('../services/solicitudesService', () => ({
  solicitudesService: {
    consultarSolicitudesAmpliacionPlazoRecibidas: vi.fn(),
  },
}));

const consultar = vi.mocked(solicitudesService.consultarSolicitudesAmpliacionPlazoRecibidas);

const solicitud: Solicitud = {
  id: 's-1',
  mensajeSolicitud: 'Necesito más tiempo para el informe.',
  fechaCreacion: '2026-09-01T15:30:00Z',
  tipoSolicitudId: 't-1',
  tipoSolicitudNombre: 'AMPLIACION_DE_PLAZO',
  remitente: { usuarioId: 'u-1', identificador: '2001', nombre: 'Luis', email: 'luis@uco.edu.co' },
  destinatario: { usuarioId: 'u-2', identificador: '1001', nombre: 'Ana', email: 'ana@uco.edu.co' },
};

function crearPagina(numero: number, content: Solicitud[]): Page<Solicitud> {
  return {
    content,
    page: numero,
    size: 10,
    totalElements: 12,
    totalPages: 2,
    first: numero === 0,
    last: numero === 1,
    empty: content.length === 0,
  };
}

function crearWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useSolicitudesAmpliacionPlazoRecibidas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockImplementation((pagina = 0) =>
      Promise.resolve(crearPagina(pagina, pagina === 0 ? [solicitud] : [])),
    );
  });

  it('consulta la página 0 con tamaño 10', async () => {
    // Act
    const { result } = renderHook(() => useSolicitudesAmpliacionPlazoRecibidas(0), {
      wrapper: crearWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith(0, 10);
    expect(result.current.data?.content).toEqual([solicitud]);
    expect(result.current.pageSize).toBe(10);
    expect(SOLICITUDES_AMPLIACION_PLAZO_RECIBIDAS_QUERY_KEY).toEqual([
      'solicitudes',
      'ampliacion-plazo',
      'recibidas',
    ]);
  });

  it('vuelve a consultar con la página nueva cuando cambia la página recibida', async () => {
    // Arrange
    const { result, rerender } = renderHook(
      ({ page }) => useSolicitudesAmpliacionPlazoRecibidas(page),
      {
        wrapper: crearWrapper(),
        initialProps: { page: 0 },
      },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Act
    rerender({ page: 1 });

    // Assert
    await waitFor(() => expect(consultar).toHaveBeenLastCalledWith(1, 10));
    await waitFor(() => expect(result.current.data?.page).toBe(1));
  });

  it('expone el error cuando el service falla', async () => {
    // Arrange
    consultar.mockRejectedValue(new Error('fallo de red'));

    // Act
    const { result } = renderHook(() => useSolicitudesAmpliacionPlazoRecibidas(0), {
      wrapper: crearWrapper(),
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
