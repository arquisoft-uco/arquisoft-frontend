import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import type { Evaluacion } from '../models/Evaluacion';
import { evaluacionesService } from '../services/evaluacionesService';
import { useEvaluacionesEstudiante } from './useEvaluacionesEstudiante';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: {
    getEvaluacionesEstudiante: vi.fn(),
    getEvaluacionesCoordinador: vi.fn(),
  },
}));

const consultar = vi.mocked(evaluacionesService.getEvaluacionesEstudiante);
const consultarCoordinador = vi.mocked(evaluacionesService.getEvaluacionesCoordinador);

const evaluacion: Evaluacion = {
  id: 'e-1',
  entregable: { id: 'en-1', proyecto: 'Sistema de monitoreo', version: 1 },
  estado: { id: 'PENDIENTE', nombre: 'Pendiente' },
};

function crearPagina(numero: number, content: Evaluacion[]): Page<Evaluacion> {
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

function montarEn(entrada = '/') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 60_000 } },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[entrada]}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  }
  return { queryClient, ...renderHook(() => useEvaluacionesEstudiante(), { wrapper: Wrapper }) };
}

describe('useEvaluacionesEstudiante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockImplementation(({ pagina }) =>
      Promise.resolve(crearPagina(pagina, [evaluacion])),
    );
  });

  it('consulta el service del estudiante, nunca el del coordinador, con orden por proyecto y sin filtros', async () => {
    // Act
    const { result } = montarEn();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith({
      pagina: 0,
      tamanio: 10,
      ordenamiento: ['proyecto:ASC'],
      filtros: undefined,
    });
    expect(consultarCoordinador).not.toHaveBeenCalled();
    expect(result.current.data?.content).toEqual([evaluacion]);
  });

  it('con texto y estados en la URL envía el grupo AND y pide la página en base 0', async () => {
    // Act
    const { result } = montarEn('/?pagina=2&q=monitoreo&estado=PENDIENTE');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith({
      pagina: 1,
      tamanio: 10,
      ordenamiento: ['proyecto:ASC'],
      filtros: {
        tipo: 'GRUPO',
        conector: 'AND',
        nodos: [
          { tipo: 'PREDICADO', campo: 'proyecto', operador: 'CONTIENE', valor: 'monitoreo' },
          {
            tipo: 'PREDICADO_MULTIVALOR',
            campo: 'estado',
            operador: 'IN',
            valores: ['PENDIENTE'],
          },
        ],
      },
    });
  });

  it('cachea bajo la clave de estudiante, sin colisionar con la del coordinador', async () => {
    // Act
    const { result, queryClient } = montarEn();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    const claves = queryClient
      .getQueryCache()
      .getAll()
      .map((q) => q.queryKey);
    expect(claves).toHaveLength(1);
    expect(claves[0].slice(0, 3)).toEqual(['evaluaciones', 'estudiante', 0]);
  });

  it('ordenar por estado consulta ordenado y expone el error cuando el service falla', async () => {
    // Arrange
    const { result } = montarEn();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Act
    act(() => result.current.setOrden('estado', 'DESC'));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(
        expect.objectContaining({ ordenamiento: ['estado:DESC'] }),
      ),
    );

    // Arrange
    consultar.mockRejectedValue(new Error('fallo de red'));

    // Act
    const fallido = montarEn();

    // Assert
    await waitFor(() => expect(fallido.result.current.isError).toBe(true));
  });
});
