import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import { evaluacionesService } from '../services/evaluacionesService';
import {
  construirFiltrosAsignadas,
  useEvaluacionesAsignadasJurado,
} from './useEvaluacionesAsignadasJurado';
import type { EvaluacionAsignadaJurado } from '../models/EvaluacionAsignadaJurado';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: { getEvaluacionesAsignadasJurado: vi.fn() },
}));

const getAsignadas = vi.mocked(evaluacionesService.getEvaluacionesAsignadasJurado);

const ASIGNACION: EvaluacionAsignadaJurado = {
  id: 'ej-1',
  estado: { id: 'PENDIENTE_POR_EVALUAR', nombre: 'Pendiente por evaluar' },
  evaluacion: { id: 'e-1', estado: { id: 'PENDIENTE', nombre: 'Pendiente' } },
  entregable: { id: 'en-1', proyecto: 'Sistema de monitoreo', version: 2 },
};

const PAGINA: Page<EvaluacionAsignadaJurado> = {
  content: [ASIGNACION],
  page: 0,
  size: 10,
  totalElements: 1,
  totalPages: 1,
  first: true,
  last: true,
  empty: false,
};

function crearContexto(opcionesQueries: { staleTime?: number } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, ...opcionesQueries } },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </MemoryRouter>
    );
  }
  return { Wrapper, queryClient };
}

describe('construirFiltrosAsignadas', () => {
  it('sin texto ni estados no envía filtros', () => {
    expect(construirFiltrosAsignadas('  ', [])).toBeUndefined();
  });

  it('combina proyecto y estadoJurado en un grupo AND', () => {
    expect(construirFiltrosAsignadas(' robot ', ['EVALUADA'])).toEqual({
      tipo: 'GRUPO',
      conector: 'AND',
      nodos: [
        { tipo: 'PREDICADO', campo: 'proyecto', operador: 'CONTIENE', valor: 'robot' },
        {
          tipo: 'PREDICADO_MULTIVALOR',
          campo: 'estadoJurado',
          operador: 'IN',
          valores: ['EVALUADA'],
        },
      ],
    });
  });
});

describe('useEvaluacionesAsignadasJurado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('pide la primera página sin filtros y devuelve la página del service', async () => {
    // Arrange
    getAsignadas.mockResolvedValue(PAGINA);
    const { Wrapper } = crearContexto();

    // Act
    const { result } = renderHook(() => useEvaluacionesAsignadasJurado(), { wrapper: Wrapper });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(PAGINA);
    expect(getAsignadas).toHaveBeenCalledWith({ pagina: 0, tamanio: 10, filtros: undefined });
  });

  it('al alternar un estado del jurado lo envía como filtro estadoJurado', async () => {
    // Arrange
    getAsignadas.mockResolvedValue(PAGINA);
    const { Wrapper } = crearContexto();
    const { result } = renderHook(() => useEvaluacionesAsignadasJurado(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Act
    act(() => result.current.toggleEstadoJurado('PENDIENTE_POR_EVALUAR'));

    // Assert
    await waitFor(() =>
      expect(getAsignadas).toHaveBeenLastCalledWith({
        pagina: 0,
        tamanio: 10,
        filtros: {
          tipo: 'PREDICADO_MULTIVALOR',
          campo: 'estadoJurado',
          operador: 'IN',
          valores: ['PENDIENTE_POR_EVALUAR'],
        },
      }),
    );
    expect(result.current.estadoJuradoIds).toEqual(['PENDIENTE_POR_EVALUAR']);
  });

  it('expone el error cuando el service rechaza', async () => {
    // Arrange
    getAsignadas.mockRejectedValue(new Error('500'));
    const { Wrapper } = crearContexto();

    // Act
    const { result } = renderHook(() => useEvaluacionesAsignadasJurado(), { wrapper: Wrapper });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('vuelve a pedir la lista al remontar aunque el staleTime global la considere fresca', async () => {
    // Arrange
    getAsignadas.mockResolvedValue(PAGINA);
    const { Wrapper } = crearContexto({ staleTime: 5 * 60 * 1000 });
    const primero = renderHook(() => useEvaluacionesAsignadasJurado(), { wrapper: Wrapper });
    await waitFor(() => expect(primero.result.current.isSuccess).toBe(true));
    primero.unmount();

    // Act
    renderHook(() => useEvaluacionesAsignadasJurado(), { wrapper: Wrapper });

    // Assert
    await waitFor(() => expect(getAsignadas).toHaveBeenCalledTimes(2));
  });
});
