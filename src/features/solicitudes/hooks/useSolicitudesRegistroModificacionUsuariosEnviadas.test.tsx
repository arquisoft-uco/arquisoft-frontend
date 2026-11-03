import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import type { Solicitud } from '../models/Solicitud';
import { solicitudesService } from '../services/solicitudesService';
import { useSolicitudesRegistroModificacionUsuariosEnviadas } from './useSolicitudesRegistroModificacionUsuariosEnviadas';

vi.mock('../services/solicitudesService', () => ({
  solicitudesService: {
    consultarSolicitudesRegistroModificacionUsuariosEnviadas: vi.fn(),
  },
}));

const consultar = vi.mocked(
  solicitudesService.consultarSolicitudesRegistroModificacionUsuariosEnviadas,
);

const solicitud: Solicitud = {
  id: 's-1',
  mensajeSolicitud: 'Registrar un usuario nuevo.',
  fechaCreacion: '2026-09-01T15:30:00Z',
  tipoSolicitudId: 't-4',
  tipoSolicitudNombre: 'REGISTRO_Y_MODIFICACION_DE_USUARIOS',
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

function crearQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 5000 } },
  });
}

function crearWrapper(queryClient = crearQueryClient()) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useSolicitudesRegistroModificacionUsuariosEnviadas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockImplementation((pagina = 0) =>
      Promise.resolve(crearPagina(pagina, pagina === 0 ? [solicitud] : [])),
    );
  });

  it('consulta la página 0 con tamaño 10 y la guarda bajo la clave de enviadas de registro y modificación de usuarios', async () => {
    // Arrange
    const queryClient = crearQueryClient();

    // Act
    const { result } = renderHook(() => useSolicitudesRegistroModificacionUsuariosEnviadas(), {
      wrapper: crearWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith(0, 10);
    expect(result.current.data?.content).toEqual([solicitud]);
    expect(result.current.page).toBe(0);
    expect(result.current.pageSize).toBe(10);
    expect(
      queryClient.getQueryData(['solicitudes', 'registro-modificacion-usuarios', 'enviadas', 0]),
    ).toEqual(result.current.data);
  });

  it('vuelve a consultar con la página nueva cuando se llama a goToPage', async () => {
    // Arrange
    const { result } = renderHook(() => useSolicitudesRegistroModificacionUsuariosEnviadas(), {
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
    const { result } = renderHook(() => useSolicitudesRegistroModificacionUsuariosEnviadas(), {
      wrapper: crearWrapper(),
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
