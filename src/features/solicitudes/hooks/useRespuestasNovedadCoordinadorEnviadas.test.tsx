import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import type { ParametrosRespuestas } from '../models/ParametrosRespuestas';
import type { RespuestaSolicitud } from '../models/RespuestaSolicitud';
import { RESPUESTA } from '../../../test-utils/respuestas';
import { solicitudesService } from '../services/solicitudesService';
import { useRespuestasNovedadCoordinadorEnviadas } from './useRespuestasNovedadCoordinadorEnviadas';

vi.mock('../services/solicitudesService', () => ({
  solicitudesService: {
    consultarRespuestasNovedadCoordinadorEnviadas: vi.fn(),
  },
}));

const consultar = vi.mocked(solicitudesService.consultarRespuestasNovedadCoordinadorEnviadas);

const PARAMETROS: ParametrosRespuestas = {
  page: 0,
  estadoIds: [],
  ordenCampo: 'fechaRespuesta',
  ordenDireccion: 'DESC',
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

describe('useRespuestasNovedadCoordinadorEnviadas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockResolvedValue(crearPagina(0, [RESPUESTA]));
  });

  it('consulta con el criterio por defecto y expone el contenido', async () => {
    // Act
    const { result } = renderHook(() => useRespuestasNovedadCoordinadorEnviadas(PARAMETROS), {
      wrapper: crearWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith({
      pagina: 0,
      tamanio: 10,
      ordenamiento: ['fechaRespuesta:DESC'],
      filtros: undefined,
    });
    expect(result.current.data?.content).toEqual([RESPUESTA]);
    expect(result.current.pageSize).toBe(10);
  });

  it('envía estados y orden en el criterio', async () => {
    // Act
    const { result } = renderHook(
      () =>
        useRespuestasNovedadCoordinadorEnviadas({
          page: 1,
          estadoIds: ['APROBADA'],
          ordenCampo: 'destinatarioNombre',
          ordenDireccion: 'ASC',
        }),
      { wrapper: crearWrapper() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith({
      pagina: 1,
      tamanio: 10,
      ordenamiento: ['destinatarioNombre:ASC'],
      filtros: {
        tipo: 'PREDICADO_MULTIVALOR',
        campo: 'estadoRespuestaId',
        operador: 'IN',
        valores: ['APROBADA'],
      },
    });
  });

  it('al cambiar el filtro consulta de nuevo y conserva la página anterior mientras carga', async () => {
    // Arrange
    let resolverSegunda: (p: Page<RespuestaSolicitud>) => void = () => undefined;
    consultar.mockImplementation((criterio) =>
      criterio.filtros === undefined
        ? Promise.resolve(crearPagina(0, [RESPUESTA]))
        : new Promise((resolver) => {
            resolverSegunda = resolver;
          }),
    );
    const { result, rerender } = renderHook(
      ({ parametros }) => useRespuestasNovedadCoordinadorEnviadas(parametros),
      { wrapper: crearWrapper(), initialProps: { parametros: PARAMETROS } },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Act
    rerender({ parametros: { ...PARAMETROS, estadoIds: ['EN_REVISION'] } });

    // Assert
    await waitFor(() => expect(consultar).toHaveBeenCalledTimes(2));
    expect(result.current.isPlaceholderData).toBe(true);
    expect(result.current.data?.content).toEqual([RESPUESTA]);

    // Act
    resolverSegunda(crearPagina(0, []));

    // Assert
    await waitFor(() => expect(result.current.isPlaceholderData).toBe(false));
    expect(result.current.data?.content).toEqual([]);
  });
});
