import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import type { Evaluacion } from '../models/Evaluacion';
import { evaluacionesService } from '../services/evaluacionesService';
import { useEvaluacionesAsesor } from './useEvaluacionesAsesor';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: {
    getEvaluacionesAsesor: vi.fn(),
    getEvaluacionesEstudiante: vi.fn(),
    getEvaluacionesCoordinador: vi.fn(),
  },
}));

const consultar = vi.mocked(evaluacionesService.getEvaluacionesAsesor);
const consultarEstudiante = vi.mocked(evaluacionesService.getEvaluacionesEstudiante);
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
  return { queryClient, ...renderHook(() => useEvaluacionesAsesor(), { wrapper: Wrapper }) };
}

describe('useEvaluacionesAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockImplementation(({ pagina }) =>
      Promise.resolve(crearPagina(pagina, [evaluacion])),
    );
  });

  it('consulta solo el service del asesor, con orden por proyecto, y cachea bajo la clave del asesor', async () => {
    // Act
    const { result, queryClient } = montarEn();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith({
      pagina: 0,
      tamanio: 10,
      ordenamiento: ['proyecto:ASC'],
      filtros: undefined,
    });
    expect(consultarEstudiante).not.toHaveBeenCalled();
    expect(consultarCoordinador).not.toHaveBeenCalled();
    expect(result.current.data?.content).toEqual([evaluacion]);
    const claves = queryClient
      .getQueryCache()
      .getAll()
      .map((q) => q.queryKey);
    expect(claves).toHaveLength(1);
    expect(claves[0].slice(0, 3)).toEqual(['evaluaciones', 'asesor', 0]);
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
});
