import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import type { Solicitud } from '../models/Solicitud';
import { solicitudesService } from '../services/solicitudesService';
import {
  SOLICITUDES_ASESOR_ENVIADAS_QUERY_KEY,
  useSolicitudesNovedadAsesorEnviadas,
} from './useSolicitudesNovedadAsesorEnviadas';

vi.mock('../services/solicitudesService', () => ({
  solicitudesService: {
    consultarSolicitudesNovedadAsesorEnviadas: vi.fn(),
  },
}));

const consultar = vi.mocked(solicitudesService.consultarSolicitudesNovedadAsesorEnviadas);

const solicitud: Solicitud = {
  id: 's-1',
  mensajeSolicitud: 'Mi asesor no responde.',
  fechaCreacion: '2026-09-01T15:30:00Z',
  tipoSolicitudId: 't-1',
  tipoSolicitudNombre: 'NOVEDAD_PARA_EL_ASESOR',
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

describe('useSolicitudesNovedadAsesorEnviadas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockImplementation((pagina = 0) =>
      Promise.resolve(crearPagina(pagina, pagina === 0 ? [solicitud] : [])),
    );
  });

  it('expone la clave de prefijo de enviadas al asesor y la usa en la query', async () => {
    // Act
    const { result } = renderHook(() => useSolicitudesNovedadAsesorEnviadas(), {
      wrapper: crearWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(SOLICITUDES_ASESOR_ENVIADAS_QUERY_KEY).toEqual([
      'solicitudes',
      'novedad-asesor',
      'enviadas',
    ]);
  });

  it('consulta la página 0 con tamaño 10', async () => {
    // Act
    const { result } = renderHook(() => useSolicitudesNovedadAsesorEnviadas(), {
      wrapper: crearWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith(0, 10);
    expect(result.current.data?.content).toEqual([solicitud]);
    expect(result.current.page).toBe(0);
    expect(result.current.pageSize).toBe(10);
  });

  it('vuelve a consultar con la página nueva cuando se llama a goToPage', async () => {
    // Arrange
    const { result } = renderHook(() => useSolicitudesNovedadAsesorEnviadas(), {
      wrapper: crearWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Act
    act(() => result.current.goToPage(1));

    // Assert
    await waitFor(() => expect(consultar).toHaveBeenLastCalledWith(1, 10));
    await waitFor(() => expect(result.current.data?.page).toBe(1));
    expect(result.current.page).toBe(1);
  });

  it('expone el error cuando el service falla', async () => {
    // Arrange
    consultar.mockRejectedValue(new Error('fallo de red'));

    // Act
    const { result } = renderHook(() => useSolicitudesNovedadAsesorEnviadas(), {
      wrapper: crearWrapper(),
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
