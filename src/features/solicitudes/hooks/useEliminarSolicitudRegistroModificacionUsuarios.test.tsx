import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { solicitudesService } from '../services/solicitudesService';
import { useEliminarSolicitudRegistroModificacionUsuarios } from './useEliminarSolicitudRegistroModificacionUsuarios';
import { SOLICITUDES_REGISTRO_MODIFICACION_USUARIOS_ENVIADAS_QUERY_KEY } from './useSolicitudesRegistroModificacionUsuariosEnviadas';

vi.mock('../services/solicitudesService', () => ({
  solicitudesService: {
    eliminarSolicitudRegistroModificacionUsuarios: vi.fn(),
  },
}));

const eliminarSolicitudRegistroModificacionUsuarios = vi.mocked(
  solicitudesService.eliminarSolicitudRegistroModificacionUsuarios,
);

function crearContexto() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { Wrapper, queryClient };
}

describe('useEliminarSolicitudRegistroModificacionUsuarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('elimina con el id recibido e invalida el prefijo del listado de enviadas de registro y modificación de usuarios', async () => {
    // Arrange
    eliminarSolicitudRegistroModificacionUsuarios.mockResolvedValue(undefined);
    const { Wrapper, queryClient } = crearContexto();
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useEliminarSolicitudRegistroModificacionUsuarios(), {
      wrapper: Wrapper,
    });

    // Act
    act(() => result.current.mutate('s-1'));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(eliminarSolicitudRegistroModificacionUsuarios).toHaveBeenCalledWith('s-1');
    expect(invalidar).toHaveBeenCalledTimes(1);
    expect(invalidar).toHaveBeenCalledWith({
      queryKey: SOLICITUDES_REGISTRO_MODIFICACION_USUARIOS_ENVIADAS_QUERY_KEY,
    });
  });

  it('expone el error e invalida igual el listado cuando el service rechaza', async () => {
    // Arrange
    eliminarSolicitudRegistroModificacionUsuarios.mockRejectedValue(new Error('422'));
    const { Wrapper, queryClient } = crearContexto();
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useEliminarSolicitudRegistroModificacionUsuarios(), {
      wrapper: Wrapper,
    });

    // Act
    act(() => result.current.mutate('s-1'));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledTimes(1);
    expect(invalidar).toHaveBeenCalledWith({
      queryKey: SOLICITUDES_REGISTRO_MODIFICACION_USUARIOS_ENVIADAS_QUERY_KEY,
    });
  });
});
