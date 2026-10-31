import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import type { ParametrosRespuestas } from '../models/ParametrosRespuestas';
import type { RespuestaSolicitud } from '../models/RespuestaSolicitud';
import { RESPUESTA_REGISTRO_MODIFICACION_USUARIOS } from '../../../test-utils/respuestas';
import { solicitudesService } from '../services/solicitudesService';
import {
  RESPUESTAS_REGISTRO_MODIFICACION_USUARIOS_ENVIADAS_QUERY_KEY,
  useRespuestasRegistroModificacionUsuariosEnviadas,
} from './useRespuestasRegistroModificacionUsuariosEnviadas';

vi.mock('../services/solicitudesService', () => ({
  solicitudesService: {
    consultarRespuestasRegistroModificacionUsuariosEnviadas: vi.fn(),
  },
}));

const consultar = vi.mocked(
  solicitudesService.consultarRespuestasRegistroModificacionUsuariosEnviadas,
);

const PARAMETROS: ParametrosRespuestas = {
  page: 0,
  estadoIds: [],
  ordenCampo: 'fechaRespuesta',
  ordenDireccion: 'DESC',
};

function crearPagina(content: RespuestaSolicitud[]): Page<RespuestaSolicitud> {
  return {
    content,
    page: 0,
    size: 10,
    totalElements: content.length,
    totalPages: 1,
    first: true,
    last: true,
    empty: content.length === 0,
  };
}

function crearCliente() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
}

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useRespuestasRegistroModificacionUsuariosEnviadas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockResolvedValue(crearPagina([RESPUESTA_REGISTRO_MODIFICACION_USUARIOS]));
  });

  it('consulta con el criterio por defecto, expone el contenido y registra la key con el prefijo', async () => {
    // Arrange
    const queryClient = crearCliente();

    // Act
    const { result } = renderHook(
      () => useRespuestasRegistroModificacionUsuariosEnviadas(PARAMETROS),
      {
        wrapper: crearWrapper(queryClient),
      },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith({
      pagina: 0,
      tamanio: 10,
      ordenamiento: ['fechaRespuesta:DESC'],
      filtros: undefined,
    });
    expect(result.current.data?.content).toEqual([RESPUESTA_REGISTRO_MODIFICACION_USUARIOS]);
    expect(result.current.pageSize).toBe(10);
    expect(
      queryClient
        .getQueryCache()
        .findAll({ queryKey: RESPUESTAS_REGISTRO_MODIFICACION_USUARIOS_ENVIADAS_QUERY_KEY }),
    ).toHaveLength(1);
  });

  it('envía estados, página y orden en el criterio', async () => {
    // Act
    const { result } = renderHook(
      () =>
        useRespuestasRegistroModificacionUsuariosEnviadas({
          page: 1,
          estadoIds: ['APROBADA'],
          ordenCampo: 'destinatarioNombre',
          ordenDireccion: 'ASC',
        }),
      { wrapper: crearWrapper(crearCliente()) },
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
});
