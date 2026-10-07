import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import type { RespuestaSolicitud } from '../models/RespuestaSolicitud';
import { solicitudesService } from '../services/solicitudesService';
import { useRespuestasNovedadCoordinadorRecibidas } from './useRespuestasNovedadCoordinadorRecibidas';

vi.mock('../services/solicitudesService', () => ({
  solicitudesService: {
    consultarRespuestasNovedadCoordinadorRecibidas: vi.fn(),
  },
}));

const consultar = vi.mocked(solicitudesService.consultarRespuestasNovedadCoordinadorRecibidas);

const respuesta: RespuestaSolicitud = {
  id: 'r-1',
  contenido: 'Programemos una reunión.',
  fechaRespuesta: '2026-09-02T10:00:00Z',
  estadoRespuestaId: 'APROBADA',
  estadoRespuestaNombre: 'Aprobada',
  solicitud: {
    id: 's-1',
    mensajeSolicitud: 'No he podido contactar a mi asesor.',
    fechaCreacion: '2026-09-01T15:30:00Z',
    tipoSolicitudId: 't-1',
    tipoSolicitudNombre: 'NOVEDAD_PARA_EL_COORDINADOR',
    remitente: {
      usuarioId: 'u-1',
      identificador: '2001',
      nombre: 'Luis',
      email: 'luis@uco.edu.co',
    },
    destinatario: {
      usuarioId: 'u-2',
      identificador: '1001',
      nombre: 'Ana',
      email: 'ana@uco.edu.co',
    },
  },
};

function crearPagina(numero: number, content: RespuestaSolicitud[]): Page<RespuestaSolicitud> {
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

describe('useRespuestasNovedadCoordinadorRecibidas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockImplementation((pagina = 0) =>
      Promise.resolve(crearPagina(pagina, pagina === 0 ? [respuesta] : [])),
    );
  });

  it('consulta la página 0 con tamaño 10 y expone el contenido', async () => {
    // Act
    const { result } = renderHook(() => useRespuestasNovedadCoordinadorRecibidas(0), {
      wrapper: crearWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith(0, 10);
    expect(result.current.data?.content).toEqual([respuesta]);
    expect(result.current.pageSize).toBe(10);
  });

  it('al cambiar de página consulta la nueva y conserva la anterior mientras carga', async () => {
    // Arrange
    let resolverSegunda: (p: Page<RespuestaSolicitud>) => void = () => undefined;
    consultar.mockImplementation((pagina = 0) =>
      pagina === 0
        ? Promise.resolve(crearPagina(0, [respuesta]))
        : new Promise((resolver) => {
            resolverSegunda = resolver;
          }),
    );
    const { result, rerender } = renderHook(
      ({ page }) => useRespuestasNovedadCoordinadorRecibidas(page),
      { wrapper: crearWrapper(), initialProps: { page: 0 } },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Act
    rerender({ page: 1 });

    // Assert
    await waitFor(() => expect(consultar).toHaveBeenLastCalledWith(1, 10));
    expect(result.current.isPlaceholderData).toBe(true);
    expect(result.current.data?.content).toEqual([respuesta]);

    // Act
    resolverSegunda(crearPagina(1, []));

    // Assert
    await waitFor(() => expect(result.current.data?.page).toBe(1));
    expect(result.current.isPlaceholderData).toBe(false);
  });
});
